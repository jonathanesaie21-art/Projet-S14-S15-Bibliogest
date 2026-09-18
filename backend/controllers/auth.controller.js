import bcrypt from "bcrypt";
import { passwordResetApi } from "../models/password-reset.model.js";
import { sendMail, isMailerConfigured } from "../config/mailer.js";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { usersApi } from "../models/users.model.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email et mot de passe sont requis." });
    }

    const row = await usersApi.findByEmailWithPassword(email);

    if (!row || !row.password_hash) {
      return res
        .status(401)
        .json({ error: "Email ou mot de passe incorrect." });
    }

    const match = await bcrypt.compare(password, row.password_hash);
    if (!match) {
      return res
        .status(401)
        .json({ error: "Email ou mot de passe incorrect." });
    }

    const user = {
      id: String(row.id),
      name: row.name,
      email: row.email,
      phone: row.phone,
      role: row.role,
    };
    const token = jwt.sign(
      { sub: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

function isEmailAllowed(email) {
  const allowedEmails = (process.env.ALLOWED_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const allowedDomain = (process.env.ALLOWED_EMAIL_DOMAIN || "")
    .trim()
    .toLowerCase();

  if (allowedEmails.length === 0 && !allowedDomain) return true; // pas de restriction configurée
  if (allowedEmails.includes(email.toLowerCase())) return true;
  if (allowedDomain && email.toLowerCase().endsWith(`@${allowedDomain}`)) {
    return true;
  }
  return false;
}

export async function googleLogin(req, res, next) {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "idToken est requis." });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload.email_verified) {
      return res
        .status(403)
        .json({ error: "Adresse email Google non vérifiée." });
    }
    if (!isEmailAllowed(payload.email)) {
      return res.status(403).json({
        error: "Cette adresse n'est pas autorisée à accéder à BiblioGest.",
      });
    }

    let user = await usersApi.findByGoogleId(payload.sub);
    if (!user) {
      const existingByEmail = await usersApi.findByEmail(payload.email);
      user = existingByEmail
        ? await usersApi.linkGoogleId(existingByEmail.id, payload.sub)
        : await usersApi.createFromGoogle({
            name: payload.name || payload.email,
            email: payload.email,
            googleId: payload.sub,
          });
    }

    const token = jwt.sign(
      { sub: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({ token, user });
  } catch (err) {
    if (
      err.message?.includes("Token used too late") ||
      err.message?.includes("Wrong number of segments") ||
      err.message?.includes("Invalid token signature")
    ) {
      return res.status(401).json({
        error: "Session Google invalide ou expirée, réessaie de te connecter.",
      });
    }
    next(err);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email requis." });

    const user = await usersApi.findByEmail(email);
    let devResetUrl = null;

    if (user) {
      const token = await passwordResetApi.createToken(user.id);
      const resetLink = `${process.env.FRONTEND_URL || "http://127.0.0.1:8000"}/index.html?resetToken=${token}`;
      await sendMail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe BiblioGest",
        html: `<p>Bonjour ${user.name},</p>
               <p>Cliquez ici pour choisir un nouveau mot de passe (valable 30 minutes) :</p>
               <p><a href="${resetLink}">${resetLink}</a></p>`,
      });

      // Uniquement quand AUCUN SMTP n'est branché (dev local) : on renvoie
      // le lien directement au frontend pour éviter d'aller le lire dans le
      // terminal. Dès qu'un vrai SMTP est configuré, isMailerConfigured()
      // devient true et cette ligne ne s'exécute plus jamais — le lien ne
      // doit alors sortir QUE par email, sinon n'importe qui pourrait
      // réinitialiser le mot de passe de n'importe quel compte sans jamais
      // recevoir l'email.
      if (!isMailerConfigured()) {
        devResetUrl = resetLink;
      }
    }

    res.json({
      message: "Si ce compte existe, un email a été envoyé.",
      ...(devResetUrl ? { devResetUrl } : {}),
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res
        .status(400)
        .json({ error: "Token et nouveau mot de passe requis." });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Le mot de passe doit faire au moins 8 caractères." });
    }
    const record = await passwordResetApi.findValidToken(token);
    if (!record) {
      return res.status(400).json({ error: "Lien invalide ou expiré." });
    }
    const hash = await bcrypt.hash(password, 10);
    await usersApi.updatePassword(record.user_id, hash);
    await passwordResetApi.markUsed(record.id);
    res.json({ message: "Mot de passe mis à jour." });
  } catch (err) {
    next(err);
  }
}
