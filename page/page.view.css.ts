namespace $.$$ {

	$mol_style_define( $bog_gram_page, {

		width: '26rem',

		Head: {
			padding: {
				top: $mol_style_func.calc( `${ $mol_gap.block } + env(safe-area-inset-top)` ),
				bottom: $mol_gap.block,
				left: $mol_gap.block,
				right: $mol_gap.block,
			},
		},

		Body_content: {
			padding: {
				top: $mol_gap.block,
				bottom: $mol_style_func.calc( `${ $mol_gap.block } + env(safe-area-inset-bottom)` ),
				left: $mol_gap.block,
				right: $mol_gap.block,
			},
		},

	} )

}
