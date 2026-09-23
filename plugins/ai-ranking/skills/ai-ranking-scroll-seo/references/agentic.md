# Agentic browsing

AI agents (ChatGPT agent, Gemini in Chrome, Claude in Chrome) increasingly read
and operate pages for people. Lighthouse 13.3+ scores this as the Agentic
Browsing category. A scroll site is at particular risk because its content is
often hidden until JavaScript animates it in.

## Requirements

1. **Content without JS.** Every word, image and link must be in the HTML and
   visible with JS off. The engine only hides cue content under `html.sc-js`,
   which one inline line in `<head>` sets before first paint. The page CSS is
   written the same way: default rules are a complete static document, and the
   cinematic layout lives under `.sc-js`. Reduced motion and the motion toggle
   simply do not set the class.
2. **Real controls.** Links are `<a href>`, actions are `<button>`, forms have
   `<label>`s, every control has an accessible name. No click handlers on divs.
3. **llms.txt** at the root: what the business is, the offer in plain numbers,
   the pages per language, the FAQ, how to make contact. Generate it from the same
   content files as the pages so it can never disagree with them.
4. **robots.txt + sitemap.xml** with hreflang alternates for multi-language.
5. **WebMCP for the main action.** Declare the enquiry form as a tool, both ways:
   - declarative: `<form toolname="..." tooldescription="...">` and
     `toolparamdescription` on each input;
   - imperative: `navigator.modelContext?.registerTool({ name, description,
     inputSchema, execute })`, guarded so browsers without it ignore it.
   The tool must do exactly what the form does, including the demo limitation if
   the form does not submit yet.

## Verify

`lighthouse-gate.mjs` reports the agentic category next to the other four.
Also screenshot the page with `javaScriptEnabled: false` and with
`reducedMotion: 'reduce'`: both must show the whole page as a readable document.
