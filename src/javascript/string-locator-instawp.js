const MyPlugin = {
	init( wp ) {
	  'use strict';
  
		if ( ! wp ) {
			return;
		}
  
		document.addEventListener( 'DOMContentLoaded', function () {
			document.addEventListener( 'click', function ( event ) {
				let button = event.target;
				if ( ! button.matches( '.instawp-activate-now' ) ) {
					return;
				}

				let slug = button.getAttribute( 'data-slug' );
				button.textContent = 'Activating plugin ...';
				event.preventDefault();

				let data = {
					action: 'install_activate_plugin',
					plugin: slug,
					nonce: instawp_activate.nonce,
				};

				let xhr = new XMLHttpRequest();
				xhr.open( 'POST', ajaxurl, true );
				xhr.setRequestHeader(
					'Content-Type',
					'application/x-www-form-urlencoded'
				);
				xhr.onreadystatechange = function () {
					if ( xhr.readyState === 4 ) {
						if ( xhr.status === 200 ) {
							let response = JSON.parse( xhr.responseText );
							if (response.success) {
								button.textContent = response.data.anchor_text;
								button.setAttribute(
									'onclick',
									"window.open('" +
										response.data.href +
										"', '_blank');"
								);
								button.setAttribute(
									'data-originaltext',
									response.data.anchor_text
								);
								button.setAttribute(
									'aria-label',
									response.data.anchor_text
								);
								button.setAttribute( 'target', '_blank' );
								button.classList.remove( 'instawp-activate-now' );
								button.classList.add(
									'string-locator-instawp-button',
									'disabled'
								);
							} else {
								let error = response.data;
								let notice = document.createElement( 'div' );
								notice.className =
									'notice notice-error is-dismissible';
								notice.innerHTML =
									'<p>Error installing and activating the plugin: ' +
									error +
									'</p><button type="button" class="notice-dismiss" onclick="this.parentNode.remove();"></button>';
								document
									.querySelector( '.wrap' )
									.insertAdjacentElement( 'afterbegin', notice );
							}
						} else {
							let errorNotice = document.createElement( 'div' );
							errorNotice.className =
								'notice notice-error is-dismissible';
							errorNotice.innerHTML =
								'<p>Error installing and activating the plugin: ' +
								xhr.statusText +
								'</p><button type="button" class="notice-dismiss" onclick="this.parentNode.remove();"></button>';
							document
								.querySelector( '.wrap' )
								.insertAdjacentElement( 'afterbegin', errorNotice );
						}
					}
				};
				let params = Object.keys( data )
					.map(function ( key ) {
						return (
							encodeURIComponent( key ) +
							'=' +
							encodeURIComponent( data[ key ] )
						);
					})
					.join( '&' );
				xhr.send( params );
			});

			document.addEventListener( 'click', function ( event ) {
				let button = event.target;
				if ( ! button.matches( '.sl-instawp-install-now' ) ) {
					return;
				}

				if (
					button.classList.contains( 'instawp-activate-now' ) ||
					button.classList.contains( 'updating-message' ) ||
					button.classList.contains( 'button-disabled' )
				) {
					return;
				}

				event.preventDefault();

				if (
					wp.updates.shouldRequestFilesystemCredentials &&
					!wp.updates.ajaxLocked
				) {
					wp.updates.requestFilesystemCredentials(event);

					document.addEventListener(
						'credential-modal-cancel',
						function () {
							let message = document.querySelector(
								'.sl-instawp-install-now.updating-message'
							);
							message.classList.remove( 'updating-message' );
							message.textContent = wp.updates.l10n.installNow;
							wp.a11y.speak (wp.updates.l10n.updateCancel, 'polite' );
						}
					);
				}

				setTimeout( function () {
					button.textContent = 'Installing plugin...';
				}, 200 );

				wp.updates.installPlugin({
					slug: button.getAttribute( 'data-slug' ),
					success: function () {
						button.textContent = 'Activating plugin ...';

						let data = {
							action: 'install_activate_plugin',
							nonce: instawp_activate.nonce,
						};

						let xhr = new XMLHttpRequest();
						xhr.open( 'POST', ajaxurl, true );
						xhr.setRequestHeader(
							'Content-Type',
							'application/x-www-form-urlencoded'
						);
						xhr.onreadystatechange = function () {
							if ( xhr.readyState === 4 ) {
								if ( xhr.status === 200 ) {
									let response = JSON.parse( xhr.responseText );
									if ( response.success ) {
										button.textContent = 'Plugin installed';

										setTimeout( function () {
											button.textContent =
												response.data.anchor_text;
											button.setAttribute(
												'onclick',
												"window.open('" +
													response.data.href +
													"', '_blank');"
											);
											button.setAttribute(
												'data-originaltext',
												response.data.anchor_text
											);
											button.setAttribute(
												'aria-label',
												response.data.anchor_text
											);
											button.setAttribute( 'target', '_blank' );
											button.classList.remove(
												'sl-instawp-install-now',
												'install-now',
												'install-instawp-connect',
												'updating-message'
											);
											button.classList.add(
												'string-locator-instawp-button',
												'disabled'
											);

											let updateNag =
												document.querySelector(
													'.update-nag'
												);
											if ( updateNag ) {
												updateNag.remove();
											}
										}, 3000 );
									} else {
										let error = response.data;
										let notice = document.createElement( 'div' );
										notice.className =
											'notice notice-error is-dismissible';
										notice.innerHTML =
											'<p>Error installing and activating the plugin: ' +
											error +
											'</p><button type="button" class="notice-dismiss" onclick="this.parentNode.remove();"></button>';
										document
											.querySelector( '.wrap' )
											.insertAdjacentElement(
												'afterbegin',
												notice
											);
									}
								} else {
									let errorNotice = document.createElement( 'div' );
									errorNotice.className =
										'notice notice-error is-dismissible';
									errorNotice.innerHTML =
										'<p>Error installing the plugin: ' +
										xhr.statusText +
										'</p><button type="button" class="notice-dismiss" onclick="this.parentNode.remove();"></button>';
									document
										.querySelector( '.wrap' )
										.insertAdjacentElement(
											'afterbegin',
											errorNotice
										);
								}
							}
						};

						let params = Object.keys( data )
							.map( function ( key ) {
								return (
									encodeURIComponent( key ) +
									'=' +
									encodeURIComponent( data[ key ] )
								);
							} )
							.join( '&' );
						xhr.send( params );
					},
					error: function ( error ) {
						let errorNotice = document.createElement( 'div' );
						errorNotice.className =
							'notice notice-error is-dismissible';
						errorNotice.innerHTML =
							'<p>Error installing the plugin: ' +
							error +
							'</p><button type="button" class="notice-dismiss" onclick="this.parentNode.remove();"></button>';
						document
							.querySelector( '.wrap' )
							.insertAdjacentElement( 'afterbegin', errorNotice );
					},
				});
			});
		});
	}
  };
  
  MyPlugin.init( window.wp );
