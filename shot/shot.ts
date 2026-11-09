namespace $ {

	export class $bog_gram_shot extends $giper_baza_dict.with({
		Image: $bog_gram_link_synced( ()=> $giper_baza_file ),
		Width: $giper_baza_atom_real,
		Height: $giper_baza_atom_real,
	}) {}

}
