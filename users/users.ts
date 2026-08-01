namespace $.$$ {

	/** Публичный реестр пользователей (для обнаружения и пуш-сервиса). */
	export class $bog_gram_users extends $giper_baza_dict.with({
		/** Название реестра: задаёт создатель, видят все. */
		Title: $giper_baza_atom_text,
		Lords: $giper_baza_list_str,
	}) {}

}
