namespace $ {

	export class $bog_gram_users extends $giper_baza_dict.with({
		Title: $giper_baza_atom_text,
		Lords: $giper_baza_list_str,
		Keys: $giper_baza_dict_to( $bog_gram_key ),
	}) {}

}
