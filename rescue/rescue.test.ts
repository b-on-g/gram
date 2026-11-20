namespace $ {

	$mol_test({

		async 'Среди локальных лендов находятся свой список диалогов и свой монитор, чужие и прочие пропускаются'( $ ) {

			const me = await $.$giper_baza_auth._generate()
			const other = await $.$giper_baza_auth._generate()

			const make = ( auth: $giper_baza_auth )=> $giper_baza_land.make({ $, auth: ()=> auth })

			const lands: Record< string, $giper_baza_land > = {
				'Dialogs1_Bigger11': make( me ),
				'Dialogs2_Smaller1': make( me ),
				'Monitor1_Watching': make( me ),
				'Groupppp_Peersss1': make( me ),
				'Foreignn_Dialogs1': make( other ),
				'Areaaaaa_Dialogs1_Subarea1': make( me ),
			}

			const ops = {
				fill() {
					lands[ 'Dialogs1_Bigger11' ].Data( $bog_gram_dialogs ).Dialogs( 'auto' )!.add( 'one' )
					lands[ 'Dialogs1_Bigger11' ].Data( $bog_gram_dialogs ).Dialogs( 'auto' )!.add( 'two' )
					lands[ 'Dialogs2_Smaller1' ].Data( $bog_gram_dialogs ).Saved_land( 'auto' )!.val( 'saved' )
					lands[ 'Monitor1_Watching' ].Data( $bog_gram_monitor ).Watch( 'auto' )!.add( 'watch' )
					lands[ 'Groupppp_Peersss1' ].Data( $bog_gram_dialog ).Peers( 'auto' )!.add( 'peer' )
					lands[ 'Foreignn_Dialogs1' ].Data( $bog_gram_dialogs ).Dialogs( 'auto' )!.add( 'alien' )
					lands[ 'Areaaaaa_Dialogs1_Subarea1' ].Data( $bog_gram_dialogs ).Dialogs( 'auto' )!.add( 'area' )
					return true
				},
			}

			await $mol_wire_async( ops ).fill()

			const rescue = $bog_gram_rescue.make({
				$,
				lord: ()=> me.pass().lord(),
				links: ()=> Object.keys( lands ),
				land: ( link: string )=> lands[ link ],
			})

			const found = await $mol_wire_async( rescue ).found()

			$mol_assert_equal( found, { dialogs: 'Dialogs1_Bigger11', watch: 'Monitor1_Watching' } )

		},

	})

}
