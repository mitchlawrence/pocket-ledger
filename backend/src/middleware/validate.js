export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] ?? "form";
      if (!fields[field]) fields[field] = issue.message;
    }
    return res.status(400).json({ error: "Please check your input.", fields });
  }

  req.body = result.data;
  next();
};
