import { isValidId } from "../utils/validators.js";

export function validateIdParam(paramName = "id") {
  return (req, res, next) => {
    if (!isValidId(req.params[paramName])) {
      return res
        .status(400)
        .json({ error: `Identifiant "${paramName}" invalide.` });
    }
    next();
  };
}
