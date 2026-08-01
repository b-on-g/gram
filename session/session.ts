namespace $.$$ {

	/** Сессия-бакет: живёт в отдельном ленде вместе со своими сообщениями. */
	export class $bog_gram_session extends $giper_baza_dict.with({
		Dialog_land: $giper_baza_atom_text,
		Messages: $giper_baza_list_link_to( ()=> $bog_gram_message ),
		/** Позиции прочтения участников, ключ — lord собеседника. */
		Reads: $giper_baza_dict_to( $bog_gram_read ),
	}) {}

}
