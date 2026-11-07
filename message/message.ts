namespace $ {

	export class $bog_gram_message extends $giper_baza_dict.with({
		Text: $giper_baza_atom_text,
		Author: $giper_baza_atom_text,
		Moment: $giper_baza_atom_real,
		Edited: $giper_baza_atom_real,
		Deleted: $giper_baza_atom_real,
		Image: $bog_gram_link_synced( ()=> $giper_baza_file ),
		Image_width: $giper_baza_atom_real,
		Image_height: $giper_baza_atom_real,
		Voice: $bog_gram_link_synced( ()=> $giper_baza_file ),
		Voice_span: $giper_baza_atom_real,
		Reply: $giper_baza_atom_text,
	}) {}

}
