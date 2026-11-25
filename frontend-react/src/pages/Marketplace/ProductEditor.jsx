import { useState } from "react";
import { categories } from "./marketplaceData";
import { parseDetailPairs } from "./productDetailUtils";
import { readStoreImage } from "./storeImages";

const imageTypes = "image/jpeg,image/png,image/webp";

async function readImages(fields, name, existing) {
  const files = fields.getAll(name).filter((file) => file.size);
  if (files.length > 4) throw new Error("Choose up to four photos for each gallery.");
  return files.length ? Promise.all(files.map(readStoreImage)) : existing;
}

async function readOptions(fields, variants, basePrice, baseOriginal) {
  const combinations = new Set();
  let names;
  const options = [];
  for (const { id, images } of variants) {
    const prefix = "variant-" + id + "-";
    const pairs = parseDetailPairs(fields.get(prefix + "attributes"), "Variant attributes", 4);
    names ??= pairs.map(({ name }) => name);
    const normalized = new Map(pairs.map(({ name, value }) => [name.toLowerCase(), value]));
    if (!names.length || pairs.length !== names.length || names.some((name) => !normalized.has(name.toLowerCase()))) {
      throw new Error("Use the same attribute names in every variant combination.");
    }
    const attributes = Object.fromEntries(names.map((name) => [name, normalized.get(name.toLowerCase())]));
    const key = JSON.stringify(Object.values(attributes).map((value) => value.toLowerCase()));
    if (combinations.has(key)) throw new Error("Each variant combination must be unique.");
    combinations.add(key);

    const price = fields.get(prefix + "price");
    const original = fields.get(prefix + "original");
    const stock = fields.get(prefix + "stock");
    if (original && Number(original) < Number(price || basePrice)) throw new Error("A variant's original price must cover its selling price.");
    const photos = await readImages(fields, prefix + "photo", fields.has(prefix + "clear-photo") ? [] : images ?? []);
    options.push({
      id, attributes, images: photos,
      ...(price ? { price: Number(price) } : {}),
      ...(original ? { original: Number(original) } : price && Number(price) > baseOriginal ? { original: Number(price) } : {}),
      ...(stock ? { stock: Number(stock) } : {}),
    });
  }
  return options;
}

function VariantFields({ variants, onAdd, onRemove }) {
  return <fieldset className="mp-editor-details">
    <legend>Product variants</legend>
    <small>Enter attributes as Name: value, one per line. Leave price and stock blank to inherit the product values.</small>
    {variants.map((variant, index) => {
      const prefix = "variant-" + variant.id + "-";
      return <fieldset key={variant.id}>
        <legend>Variant {index + 1}</legend>
        <label>Attributes<textarea name={prefix + "attributes"} maxLength={200} required placeholder={"Colour: Navy\nSize: M"}
          defaultValue={Object.entries(variant.attributes).map(([name, value]) => name + ": " + value).join("\n")} /></label>
        <div className="mp-editor-field-grid">
          <label>Price (₹)<input type="number" name={prefix + "price"} min="1" max="10000000" defaultValue={variant.price} /></label>
          <label>Original price (₹)<input type="number" name={prefix + "original"} min="1" max="10000000" defaultValue={variant.original} /></label>
          <label>Stock<input type="number" name={prefix + "stock"} min="0" max="1000000" defaultValue={variant.stock} /></label>
        </div>
        <label>Variant photos<input type="file" name={prefix + "photo"} accept={imageTypes} multiple /></label>
        {variant.images?.length > 0 && <label className="store-inline"><input type="checkbox" name={prefix + "clear-photo"} /> Use main product photos</label>}
        <button type="button" onClick={() => onRemove(variant.id)}>Remove variant</button>
      </fieldset>;
    })}
    <button type="button" disabled={variants.length >= 12} onClick={onAdd}>Add variant</button>
  </fieldset>;
}

function ListingDetailsFields({ listing }) {
  return <details className="mp-editor-details">
    <summary>Specifications, delivery and policies</summary>
    <label>Brand<input name="brand" maxLength={80} defaultValue={listing.brand} /></label>
    <label>Key features<textarea name="features" maxLength={1000} defaultValue={listing.features?.join("\n")} placeholder="One feature per line" /></label>
    <label>Specifications<textarea name="specifications" maxLength={1500} placeholder={"Material: Cotton\nCare: Machine wash"}
      defaultValue={listing.specifications?.map(({ name, value }) => name + ": " + value).join("\n")} /></label>
    <label>Package contents<textarea name="package" maxLength={500} defaultValue={listing.packageContents} /></label>
    <label>Warranty<textarea name="warranty" maxLength={500} defaultValue={listing.warranty} /></label>
    <label>Return and replacement policy<textarea name="returns" maxLength={500} defaultValue={listing.returnPolicy} /></label>
    <label>Additional details<textarea name="additional" maxLength={500} defaultValue={listing.additionalDetails} /></label>
    <div className="mp-editor-field-grid">
      <label>Demo delivery days<input name="days" type="number" min="0" max="90" defaultValue={listing.delivery?.days} /></label>
      <label>Demo delivery fee (₹)<input name="fee" type="number" min="0" max="10000" defaultValue={listing.delivery?.fee} /></label>
    </div>
    <label className="store-inline"><input type="checkbox" name="pickup" defaultChecked={listing.delivery?.pickup} /> Offer demo in-store pickup</label>
  </details>;
}

export default function ProductEditor({ listing, preview = false, onSave, onCancel }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [variants, setVariants] = useState(listing.variantOptions ?? []);

  async function save(event) {
    event.preventDefault();
    if (busy) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const name = fields.get("name").trim();
      const description = fields.get("description").trim();
      const price = Number(fields.get("price"));
      const original = Number(fields.get("original") || price);
      if (!name || !description || original < price) throw new Error("Enter a name and description. Original price must cover selling price.");
      const existing = listing.images ?? (listing.image ? [listing.image] : []);
      const images = await readImages(fields, "photo", existing);
      const details = preview ? {
        images, variants: fields.get("variants").trim(), available: fields.has("available"),
        variantOptions: await readOptions(fields, variants, price, original),
        brand: fields.get("brand").trim(),
        features: fields.get("features").split(/\r?\n/).map((feature) => feature.trim()).filter(Boolean),
        specifications: parseDetailPairs(fields.get("specifications"), "Specifications"),
        packageContents: fields.get("package").trim(), warranty: fields.get("warranty").trim(),
        returnPolicy: fields.get("returns").trim(), additionalDetails: fields.get("additional").trim(),
        delivery: {
          days: fields.get("days") ? Number(fields.get("days")) : undefined,
          fee: fields.get("fee") ? Number(fields.get("fee")) : undefined,
          pickup: fields.has("pickup"),
        },
      } : {};
      await onSave({ name, description, price, original, stock: Number(fields.get("stock")), category: fields.get("category"),
        image: images[0] || "", ...details });
    } catch (failure) { setMessage(failure.message); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save}>
    <h3>{listing.id ? "Edit product" : "New product"}</h3>
    <label>Product name<input name="name" required maxLength={100} defaultValue={listing.name} /></label>
    <label>Category<select name="category" defaultValue={listing.category}>{categories.slice(1).map((category) => <option key={category}>{category}</option>)}</select></label>
    <label>Description<textarea name="description" required maxLength={1000} defaultValue={listing.description} /></label>
    <label>Selling price (₹)<input name="price" type="number" required min="1" max="10000000" defaultValue={listing.price} /></label>
    <label>Original price (₹)<input name="original" type="number" min="1" max="10000000" defaultValue={listing.original} /></label>
    <label>Stock quantity<input name="stock" type="number" required min="0" max="1000000" defaultValue={listing.stock} /></label>
    <label>{preview ? "Product photos (up to four, replace existing photos)" : "Product photo"}<input name="photo" type="file" accept={imageTypes} multiple={preview} /></label>
    <small>JPG, PNG or WebP, up to 400 KB each.</small>
    {preview && <>
      <label>Seller options note (optional)<input name="variants" maxLength={160} defaultValue={listing.variants} /></label>
      <VariantFields variants={variants} onAdd={() => setVariants((current) => [...current, { id: crypto.randomUUID(), attributes: {} }])}
        onRemove={(id) => setVariants((current) => current.filter((variant) => variant.id !== id))} />
      <ListingDetailsFields listing={listing} />
      <label className="store-inline"><input name="available" type="checkbox" defaultChecked={listing.available !== false} /> Available for sale</label>
    </>}
    {message && <p role="alert">{message}</p>}
    <div><button type="submit" disabled={busy}>{busy ? "Saving…" : "Publish changes"}</button> <button type="button" disabled={busy} onClick={onCancel}>Cancel</button></div>
  </form>;
}
