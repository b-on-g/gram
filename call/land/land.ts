namespace $ {

	export class $bog_gram_call_land extends $giper_baza_dict.with({
		Created: $giper_baza_atom_real,
		Seats: $giper_baza_dict_to( $bog_gram_call_seat ),
		Offers: $giper_baza_dict_to( $giper_baza_atom_text ),
		Answers: $giper_baza_dict_to( $giper_baza_atom_text ),
	}) {}

}
