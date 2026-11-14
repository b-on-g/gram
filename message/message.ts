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
		Shots: $giper_baza_list_link_to( ()=> $bog_gram_shot ),
		Voice: $bog_gram_link_synced( ()=> $giper_baza_file ),
		Voice_span: $giper_baza_atom_real,
		Video: $bog_gram_link_synced( ()=> $giper_baza_file ),
		Video_width: $giper_baza_atom_real,
		Video_height: $giper_baza_atom_real,
		Reply: $giper_baza_atom_text,
		Call: $giper_baza_atom_link,
		Forwarded: $giper_baza_atom_bool,
		Contact: $giper_baza_atom_text,
		Contact_name: $giper_baza_atom_text,
	}) {}

}
