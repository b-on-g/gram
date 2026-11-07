namespace $ {

	export class $bog_gram_dialog extends $giper_baza_dict.with({
		Peers: $giper_baza_list_str,
		Sessions: $giper_baza_list_str,
		Owner: $giper_baza_atom_text,
		Session_last: $giper_baza_atom_text,
		Created: $giper_baza_atom_real,
		Title: $giper_baza_atom_text,
		Admins: $giper_baza_list_str,
	}) {}

}
