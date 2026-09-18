import { membersApi } from "../models/members.model.js";

export async function listMembers(req, res, next) {
  try {
    res.json(await membersApi.list());
  } catch (err) {
    next(err);
  }
}

export async function getMember(req, res, next) {
  try {
    const member = await membersApi.findById(req.params.id);
    if (!member)
      return res.status(404).json({ error: "Adhérent introuvable." });
    res.json(member);
  } catch (err) {
    next(err);
  }
}

export async function createMember(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Nom et email sont requis." });
    }
    res.status(201).json(await membersApi.add({ name, email, phone }));
  } catch (err) {
    next(err);
  }
}

export async function updateMember(req, res, next) {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Nom et email sont requis." });
    }
    const member = await membersApi.update({
      id: req.params.id,
      name,
      email,
      phone,
    });
    if (!member)
      return res.status(404).json({ error: "Adhérent introuvable." });
    res.json(member);
  } catch (err) {
    next(err);
  }
}

export async function deleteMember(req, res, next) {
  try {
    await membersApi.remove(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}
