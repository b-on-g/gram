namespace $.$$ {

	/** Шаренный между участниками ленд диалога: участники + ссылки на сессии-бакеты. */
	export class $bog_gram_dialog extends $giper_baza_dict.with({
		Peers: $giper_baza_list_str,
		Sessions: $giper_baza_list_str,
		Created: $giper_baza_atom_real,
	}) {}

}
