import type { FabricObject, Group } from 'fabric';

/**
 * Typed seam for "a document placed on the playground canvas".
 *
 * Historically, fragments/testimonia rendered on the FabricJS canvas were
 * identified by an ad-hoc `identifier` property mutated onto a `fabric.Group`
 * and accessed via `(group as any).identifier`. This module reifies that
 * concept: a `DocumentObject` is a `Group` carrying a known `DocumentIdentifier`
 * shape, and every reader/writer goes through the helpers below instead of
 * casting to `any`.
 *
 * The mutation contract is preserved exactly — the property is still called
 * `identifier` and still lives directly on the fabric group — so any code that
 * round-trips through `canvas.toJSON()` / `loadFromJSON()` (undo, redo, live
 * rooms) keeps working unchanged.
 */

/**
 * The lookup-key shape used to match a canvas group back to its full document
 * record in `FabricService.documents`. Mirrors the criterion used by
 * `UtilityService.filter_array` and by lesson-zone matching in
 * `TeachingFabricService`.
 */
export interface DocumentIdentifier {
  author: string;
  title: string;
  editor: string;
  name: string;
}

/**
 * A fabric `Group` known to carry a `DocumentIdentifier`. Use `tag_as_document`
 * to produce one and `is_document` / `resolve_document_ancestor` to recover it
 * from an untyped fabric object.
 */
export type DocumentObject = Group & { identifier: DocumentIdentifier };

/**
 * Mutates `group` to carry the given identifier and returns it under the
 * `DocumentObject` type. The mutation is intentional: it survives Fabric's
 * JSON serialization round-trip used by undo/redo and live rooms.
 */
export function tag_as_document(group: Group, identifier: DocumentIdentifier): DocumentObject {
  (group as DocumentObject).identifier = identifier;
  return group as DocumentObject;
}

/**
 * Typeguard for "is this fabric object a document group?". Narrows `thing` to
 * `DocumentObject` so callers can read `.identifier` without casting.
 */
export function is_document(thing: unknown): thing is DocumentObject {
  if (!thing || typeof thing !== 'object') return false;
  const identifier = (thing as { identifier?: unknown }).identifier;
  return !!identifier && typeof identifier === 'object';
}

/**
 * Reads the identifier off a `DocumentObject`. Trivial helper, but keeps the
 * "identifier lives on the group" detail localized to this module.
 */
export function get_identifier(obj: DocumentObject): DocumentIdentifier {
  return obj.identifier;
}

/**
 * Walks up the fabric parent-group chain from `candidate` until it finds a
 * `DocumentObject`, descending into child objects along the way. Returns the
 * first match or `null` if the candidate (and its ancestors/descendants) is
 * not part of any document. Mirrors the previous inline walker that
 * `TeachingCommentaryBridgeComponent` carried.
 */
export function resolve_document_ancestor(candidate: FabricObject | undefined | null): DocumentObject | null {
  if (!candidate) return null;

  if (is_document(candidate)) return candidate;

  // Descend: clicks on the inner box/text bubble up from child fabric objects
  // that themselves are not the document group.
  const child_objects = (candidate as { getObjects?: () => FabricObject[]; _objects?: FabricObject[] }).getObjects?.()
    ?? (candidate as { _objects?: FabricObject[] })._objects;
  if (child_objects?.length) {
    for (const child of child_objects) {
      const found = resolve_document_ancestor(child);
      if (found) return found;
    }
  }

  // Ascend: an active sub-target's parent chain is exposed through `.group`.
  const parent_group = (candidate as { group?: Group }).group;
  if (parent_group) return resolve_document_ancestor(parent_group);

  // Fabric v5-era code occasionally used `.parent`; preserve that fallback.
  const parent = (candidate as { parent?: FabricObject }).parent;
  if (parent) return resolve_document_ancestor(parent);

  return null;
}
