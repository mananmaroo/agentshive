# Document Visualizer — Terminal Edition

## Purpose

The hands-on version of the **Document Visualizer** agent. Give it a document and it builds
PowerPoint decks for you, end-to-end, inside Claude Code / the Claude terminal. If the
document has **highlighted** passages, it produces a focused deck of just the highlights —
the parts you flagged as important. It also always produces a **full deck** covering the
whole document, formatted to a consulting-grade (McKinsey-style) template: action titles,
one message per slide, and a clean, consistent master.

## Runtime & Requirements

Runs in Claude Code. The work is local file processing — no MCP or computer use required.
It uses the built-in filesystem tools plus the Bash tool to run two well-known Python
libraries (the agent installs them if missing):

- **`python-pptx`** — builds the `.pptx` files from a slide master.
- **`PyMuPDF` (`fitz`)** — extracts highlighted text and annotations from PDFs. For DOCX,
  highlights are read from run/​highlight formatting via `python-docx`; for Markdown, the
  convention is `==highlighted==` spans.

Preflight: `pip show python-pptx pymupdf python-docx` (install with
`pip install python-pptx pymupdf python-docx` if absent). If the user has a brand template
(`.pptx` or `.potx`), the agent uses it as the master; otherwise it applies the built-in
consulting template described below.

## Inputs Needed

- The source document (`.pdf`, `.docx`, or `.md`). Highlights are optional.
- Optional: a brand/template `.pptx`/`.potx` to match house style (colors, fonts, logo).
- Optional: target length or audience (board, team, client) to tune density.
- Output folder (default: alongside the source document).

## Workflow

1. **Read & detect highlights.** Open the document. For PDFs, scan annotations for highlight
   marks and pull the underlying text + page numbers via PyMuPDF; for DOCX, collect
   highlighted runs; for Markdown, collect `==...==` spans. Checkpoint: report how many
   highlights were found (and from which pages) before generating anything.
2. **Outline the full deck.** Build a MECE outline of the whole document: an executive
   summary up front (answer first), then grouped sections, each reduced to a single "so-what"
   message. Confirm the outline with the user if the document is long.
3. **Write action titles.** For every slide, write a full-sentence action title that states
   the takeaway (e.g. "Churn is concentrated in months 2–3, so onboarding is the highest-
   leverage fix"), not a topic label. Put supporting points and any chart beneath it.
4. **Build the full deck** with `python-pptx` on the consulting template: title slide,
   executive summary, one idea per content slide, a clear section rhythm, consistent fonts/
   colors/margins, page numbers, and a closing next-steps slide. Turn tabular data into
   simple charts where it clarifies; never decorate.
5. **Build the highlights deck** (only if highlights exist): a shorter deck containing just
   the highlighted passages, each on its own slide with an action title, the verbatim
   highlighted text quoted, and the source page cited. Same template as the full deck.
6. **Review & save.** Save both files, then summarize what each contains and flag any slide
   where the source was thin (so the user can add detail rather than the agent inventing it).

## Output Format

Two files in the output folder:
- `<name>-full.pptx` — the complete document as a consulting-grade deck.
- `<name>-highlights.pptx` — the highlighted passages only (omitted, with a note, if the
  document had no highlights).

Plus a short Markdown summary listing each deck's slides and any gaps to review.

## Guardrails & Safety

- **Never invent content.** Every slide traces to the source document; quote highlighted text
  verbatim and cite its page. If a section is too thin to support a claim, say so on the slide
  notes rather than fabricating data or figures.
- Confirm before overwriting an existing `.pptx` in the output folder.
- Keep charts honest — axes start where the data warrants, no misleading scales, label units.
- Respect the source document's confidentiality; don't send it anywhere or call external
  services — all processing is local.

## Professional References & Standards

This agent builds decks to recognized communication standards:

- **Barbara Minto's Pyramid Principle** — answer first, then grouped, MECE supporting
  arguments; the executive summary leads.
- **MECE** — section breakdowns are mutually exclusive and collectively exhaustive.
- **Action titles / "so-what" headlines (McKinsey/BCG style)** — one message per slide,
  stated as a full-sentence takeaway.
- **Gene Zelazny, *Say It With Charts*** — pick the chart type from the message (comparison,
  trend, composition, correlation), not by default.
- **Edward Tufte (data-ink ratio)** — remove chartjunk; every mark earns its place.

> This is the hands-on companion to the **Document Visualizer** agent on agentshive.net.
