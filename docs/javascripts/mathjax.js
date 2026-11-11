window.MathJax = {
  tex: {
    inlineMath: [["\\(", "\\)"]],
    displayMath: [["\\[", "\\]"]],
    processEscapes: true,
    processEnvironments: true,
    macros: {
      nd: ["\\mathsf{#1}", 1],
      R: "\\mathbb{R}",
      N: "\\mathbb{N}",
      Pow: "\\mathcal{P}",
      Atoms: "\\operatorname{Atoms}",
      Sat: "\\operatorname{Sat}",
      Frontier: "\\operatorname{Frontier}",
      Anc: "\\operatorname{Anc}",
      Desc: "\\operatorname{Desc}",
      ReqAtoms: "\\operatorname{RequiredAtoms}",
      Closure: "\\operatorname{Closure}",
      Pre: "\\operatorname{Pre}",
      Missing: "\\operatorname{Missing}",
      MissingAtoms: "\\operatorname{MissingAtoms}",
      Complete: "\\operatorname{Complete}",
      Own: "\\operatorname{Own}",
      Children: "\\operatorname{Children}",
      Id: "\\operatorname{Id}",
      Title: "\\operatorname{Title}",
      Weight: "\\operatorname{Weight}",
      ShortKey: "\\operatorname{ShortKey}",
      PhaseCompat: "\\operatorname{PhaseCompat}",
      Applicability: "\\operatorname{Applicability}",
      Work: "\\operatorname{Work}",
      Reserve: "\\operatorname{Reserve}",
      Budget: "\\operatorname{Budget}",
      Score: "\\mathit{score}",
      Passed: "\\mathit{passed}",
      MaxPoints: "\\mathit{maxPoints}",
      PassingPoints: "\\mathit{passingPoints}",
      Reff: "R_{\\mathrm{eff}}",
      Rat: "R_{\\mathrm{at}}",
      Meff: "M_{\\mathrm{eff}}"
    }
  },
  options: {
    ignoreHtmlClass: ".*|",
    processHtmlClass: "arithmatex"
  }
};

document$.subscribe(() => {
  MathJax.typesetPromise()
})
