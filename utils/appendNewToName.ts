export default function appendNewToName(name: string) {
  let insertPos = name.lastIndexOf(".");
  let newName = name
    .substring(0, insertPos)
    .concat("_new", name.substring(insertPos))
    .replace("/preds/","")
    .replace(".jpg", ".tif")
  return newName;
}
