export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] ?? "form";
        if (!fields[field]) fields[field] = issue.message;
      }
      return res
        .status(400)
        .json({ error: "Please check your input.", fields });
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      req.valid = req.valid || {};
      req.valid[source] = result.data;
    }
    next();
  };
