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
	}) {}

}
