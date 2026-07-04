export const erra = {
  title: "erra",
  version: "v0.2.0",
  tagline: "Typed errors, annotated like margin notes. No <code>Box&lt;dyn Error&gt;</code>. No forced allocations on the happy path. Just a clean, unspooling ink trail mapping the collapse.",
  description: "When systems fail, I keep the shape of the failure.",
  links: {
    github: "https://github.com/ZaudRehman/erra",
    cratesio: "https://crates.io/crates/erra",
  },
  code: {
    title: "read_config",
    return_type: "Result<Config, Error<io::Error>>",
    annotation: "failed to read config file",
    source_file: "config.toml",
  },
  trace: {
    context: "failed to read config file",
    context_type: "Cow<'static, str>",
    root_cause: "io::Error { kind: NotFound }",
  },
  field_note: {
    title: "The elegance of zero-cost.",
    body: 'Because <code>annotate</code> takes a closure or static string, returning <code>Ok(T)</code> incurs exactly <strong>0 bytes</strong> of overhead compared to raw returns. The context only materializes when the path collapses.',
  },
};
