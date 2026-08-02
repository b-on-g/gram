namespace $.$$ {

	/** Сообщение: порядок задаётся полем Moment в самих данных, а не порядком доставки. */
	export class $bog_gram_message extends $giper_baza_dict.with({
		Text: $giper_baza_atom_text,
		Author: $giper_baza_atom_text,
		Moment: $giper_baza_atom_real,
		/** Момент последней правки, отсутствует — сообщение не правилось. */
		Edited: $giper_baza_atom_real,
		/** Момент удаления, отсутствует — сообщение живое. */
		Deleted: $giper_baza_atom_real,
		/** Картинка лежит в своём ленде: переписка синкается налегке, а
		 * тяжёлый кадр приезжает отдельно и только когда его показывают. */
		Image: $bog_gram_link_synced( ()=> $giper_baza_file ),
		/** Размеры кадра в пикселях: место под него в ленте занимается
		 * заранее, и приехавшая картинка ничего под собой не сдвигает. */
		Image_width: $giper_baza_atom_real,
		Image_height: $giper_baza_atom_real,
	}) {}

}
