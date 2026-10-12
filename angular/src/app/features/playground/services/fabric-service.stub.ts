/**
 * FabricJS needs a real 2d canvas context, which jsdom does not provide. These
 * component tests only verify that the components can be created, so the canvas is
 * replaced by a small stand-in with the members the components touch.
 */
export const fabric_service_stub = () => ({
  canvas: { clear: () => {}, loadFromJSON: () => Promise.resolve(), renderAll: () => {} },
  canvas_changed_subject: { subscribe: () => ({ unsubscribe: () => {} }) },
  documents: [],
  init: () => {},
  resize: () => {},
  set_event_handlers: () => {},
  randomize_positions: () => {},
  toggle_drawing_mode: () => {},
  is_note: () => false,
  is_document: () => false,
  has_selection: () => false,
  clear: () => {},
  add: () => {},
  delete_selected: () => {},
  undo: () => {},
  redo: () => {},
  create_header: () => {},
  create_text: () => {},
  create_lines: () => {},
  create_box: () => {},
});
