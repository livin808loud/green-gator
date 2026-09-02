/* Green Gator factoring detector.
 *
 * HARD RULE: source wins. A comment that mentions a prior Amazon Relay
 * deadhead must NEVER un-factor a broker/DAT load. Do not add
 * /amazon relay/i.test(comments) as a blanket exclude.
 */
(function (root) {
  function isFactoredLoad(e) {
    const src = String((e && e.source) || '').toLowerCase();
    const c = String((e && e.comments) || '');
    if (/\bamazon(?:\s+relay)?\b/.test(src) || /(?:^|[^a-z])direct(?:[^a-z]|$)/.test(src)) return false;
    if (/\b(dat|broker|factored|logistics|highway|freight|transport|ascendtms|haul'?n)/.test(src)) return true;
    if (/\bamazon relay (?:spot )?(?:trip|load)\b/i.test(c)) return false;
    return /broker|rate confirmation|carrier (?:load )?tender|ascendtms|haul.n|tql|landstar|kch transportation|evans transportation|axle logistics|bergen|giltner|tforce|sage freight|highway/i.test(src + ' ' + c);
  }
  root.isFactoredLoad = isFactoredLoad;
  if (typeof module !== 'undefined' && module.exports) module.exports = { isFactoredLoad };
})(typeof globalThis !== 'undefined' ? globalThis : this);
