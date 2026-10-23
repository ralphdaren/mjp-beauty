/** Returns a width -> URL builder for a Cloudinary image ("v123/name.jpg"). `extra` is appended transforms, e.g. ",c_limit". */
export const cld = (id: string, extra = '', quality = 'good') => (w: number) =>
  `https://res.cloudinary.com/dr9nm40gf/image/upload/f_auto,q_auto:${quality}${extra},w_${w}/${id}`

export const toSrcSet = (img: (w: number) => string, widths: number[]) =>
  widths.map((w) => `${img(w)} ${w}w`).join(', ')
