export const validate = (schema, { partial = false } = {}) => (req, res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const issue = result.error.issues[0];
    return res.status(400).json({ error: issue.path.length ? `${issue.path.join('.')}: ${issue.message}` : issue.message });
  }
  // For partial updates keep only the fields the client actually sent, so schema defaults don't overwrite stored values.
  req.body = partial
    ? Object.fromEntries(Object.entries(result.data).filter(([k]) => Object.hasOwn(req.body, k)))
    : result.data;
  next();
};
