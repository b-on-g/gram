namespace $.$$ {

	/** Публичный профиль в home land: имя + ссылки на служебные ленды владельца. */
	export class $bog_gram_user extends $giper_baza_dict.with({
		Name: $giper_baza_atom_text,
		Inbox_land: $giper_baza_atom_text,
		Dialogs_land: $giper_baza_atom_text,
		Monitor_land: $giper_baza_atom_text,
		Devices_land: $giper_baza_atom_text,
	}) {}

}
