// This defines the "built-in" language definitions

export const jsLanguageDefinition = {
  pluginType: "language",
  languageId: "js",
  displayName: "JavaScript",
  module: "window",
  evaluator: "eval",
  url: ""
};

const PYODIDE_URL = process.env.USE_LOCAL_PYODIDE
  ? "/pyodide/pyodide.js"
  : "https://pyodide.cdn.iodide.io/pyodide.js";

const pyLanguageDefinition = {
  languageId: "py",
  displayName: "Python",
  url: PYODIDE_URL,
  module: "pyodide",
  evaluator: "runPython",
  asyncEvaluator: "runPythonAsync",
  pluginType: "language"
};

const luaLanguageDefintion = {
  languageId: "lua",
  displayName: "Lua",
  url: "https://cdn.jsdelivr.net/npm/fengari-web@0.1.4/dist/fengari-web.js",
  module: "fengari",
  evaluator: "evalLua",
  pluginType: "language"
};

const rubyLanguageDefinition = {
  languageId: "ruby",
  displayName: "Ruby",
  url: "https://cdn.opalrb.com/opal/current/opal.js",
  module: "Opal",
  evaluator: "eval",
  pluginType: "language"
};

const ocamlLanguageDefinition = {
  languageId: "ml",
  displayName: "OCaml",
  url: "https://louisabraham.github.io/domical/eval.js",
  module: "evaluator",
  evaluator: "execute",
  pluginType: "language"
};

const juliaLanguageDefinition = {
  languageId: "jl",
  displayName: "Julia",
  url: "https://keno.github.io/julia-wasm/julide/julide.js",
  module: "jlodide",
  evaluator: "runJulia",
  pluginType: "language"
};

const plantumlLanguageDefinition = {
  languageId: "pu",
  displayName: "PlantUml",
  url:
    "https://raw.githubusercontent.com/six42/iodide-plantuml-plugin/master/src/iodide-plantuml-plugin.js",
  module: "plantuml",
  evaluator: "plantuml_img",
  pluginType: "language"
};

const assemblyscriptLanguageDefinition = {
  languageId: "as",
  displayName: "AssemblyScript",
  url:
    "https://raw.githubusercontent.com/AssemblyScript/assemblyscript/master/dist/asc.js",
  module: "asmScript",
  evaluator: "eval",
  pluginType: "language"
};

const fetchLanguageDefinition = {
  languageId: "fetch",
  displayName: "Fetch",
  module: "window",
  evaluator: "eval"
};

export const languageDefinitions = {
  py: pyLanguageDefinition,
  js: jsLanguageDefinition,
  ocaml: ocamlLanguageDefinition,
  julia: juliaLanguageDefinition,
  as: assemblyscriptLanguageDefinition,
  pu: plantumlLanguageDefinition,
  lua: luaLanguageDefintion,
  ruby: rubyLanguageDefinition,
  fetch: fetchLanguageDefinition
};
