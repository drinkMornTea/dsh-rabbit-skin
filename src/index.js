/**
 * Host half of the rabbit skin.
 *
 * The skin itself is entirely a client concern: five painted frames, one token
 * layer, and two slot entries. The frames travel inside the client bundle as
 * data URIs, because a desktop shell loads the page over `file://` and cannot
 * resolve `/plugins/<id>/assets/...` the way the browser carrier can — inlining
 * keeps Web and Desktop on exactly one code path, with no HTTP route to own and
 * no asset path to guess.
 *
 * So the host plugin exists to be present: it occupies the `rabbit-skin` fiber
 * the profile patch inserts, declares no services, and does nothing.
 */

/** Package id shared by the patch entry, the client bundle id, and the token layer source. */
export const PACKAGE_ID = 'dsh-rabbit-skin';

/** No host services are required. */
export const inject = [];

/** Presence only — the skin lives in the client bundle. */
export function apply() {}
