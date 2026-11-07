namespace $ {

	export class $bog_gram_dialogs extends $giper_baza_dict.with({
		Dialogs: $giper_baza_list_str,
		Outbox: $giper_baza_list_str,
		Asks: $giper_baza_list_str,
		Asked: $giper_baza_list_str,
		Denied: $giper_baza_list_str,
		Hidden: $giper_baza_list_str,
		Accepted: $giper_baza_list_str,
		Registries: $giper_baza_list_str,
		Saved_land: $giper_baza_atom_text,
		Saved_lands: $giper_baza_list_str,
		Archived: $giper_baza_list_str,
		Notes: $giper_baza_dict_to( $bog_gram_note ),
		Passes: $giper_baza_list_str,
		Lobbies: $giper_baza_list_str,
	}) {}

}
