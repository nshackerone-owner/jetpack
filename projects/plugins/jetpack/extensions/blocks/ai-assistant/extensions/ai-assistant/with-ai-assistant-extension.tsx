/*
 * This is the new version of the AI Assistant extension.
 *
 * - Add a dialog to ask the user for a prompt.
 * - Add a toolbar button to trigger the AI Assistant.
 * - Add a keyboard shortcut to trigger the AI Assistant.
 */

/**
 * External dependencies
 */
import { useAiContext } from '@automattic/jetpack-ai-client';
import { BlockControls } from '@wordpress/block-editor';
import { parse } from '@wordpress/blocks';
import { KeyboardShortcuts } from '@wordpress/components';
import { createHigherOrderComponent } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useState, useMemo, useCallback, useEffect, useRef } from '@wordpress/element';
/**
 * Internal dependencies
 */
import { AiAssistantPopover } from '../../components/ai-assistant-dialog';
import AiAssistantToobarButton from '../../components/ai-assistant-toolbar-control';
import useTextContentFromSelectedBlocks from '../../hooks/use-text-content-from-selected-blocks';
import { PROMPT_TYPE_JETPACK_FORM_CUSTOM_PROMPT, getPrompt } from '../../lib/prompt';
import { AiAssistantUiContextProvider } from './ui-context';
import { EXTENDED_BLOCKS, isPossibleToExtendBlock } from '.';

const withAiAssistantExtension = createHigherOrderComponent( BlockListBlock => {
	return props => {
		const { isSelected, clientId } = props;
		// AI Assistant component visibility
		const [ isAssistantShown, setAssistantVisibility ] = useState( false );
		const [ isAssistantMenuShown, setAssistantMenuVisibility ] = useState( true );

		// Get the selected block client IDs.
		const { content } = useTextContentFromSelectedBlocks();

		const { replaceInnerBlocks } = useDispatch( 'core/block-editor' );
		/**
		 * Show the AI Assistant
		 *
		 * @returns {void}
		 */
		const showAssistant = useCallback( () => {
			setAssistantVisibility( true );
		}, [] );

		/**
		 * Hide the AI Assistant
		 *
		 * @returns {void}
		 */
		const hideAssistant = useCallback( () => {
			setAssistantVisibility( false );
		}, [] );

		/**
		 * Toggle the AI Assistant visibility
		 *
		 * @returns {void}
		 */
		const toggleAssistant = useCallback( () => {
			setAssistantVisibility( ! isAssistantShown );
		}, [ isAssistantShown ] );

		/**
		 * Show the AI Assistant menu
		 *
		 * @returns {void}
		 */
		const showAssistantMenu = useCallback( () => {
			setAssistantMenuVisibility( true );
		}, [] );

		/**
		 * Hide the AI Assistant menu
		 *
		 * @returns {void}
		 */
		const hideAssistantMenu = useCallback( () => {
			setAssistantMenuVisibility( false );
		}, [] );

		/*
		 * Pick the DOM element of the block,
		 * to anchor the AI Assistant popover.
		 */
		const blockDomReference = useRef< HTMLElement >();
		useEffect( () => {
			if ( ! clientId ) {
				return;
			}

			// Get the last selected block.
			// const clientId = clientIds[ clientIds.length - 1 ];
			const idAttribute = `block-${ clientId }`;

			/*
			 * Get the DOM element of the block,
			 * keeping in mind that the block element is rendered into the `editor-canvas` iframe.
			 */
			const iFrame: HTMLIFrameElement = document.querySelector( 'iframe[name="editor-canvas"]' );
			const iframeDocument = iFrame && iFrame.contentWindow.document;
			if ( ! iframeDocument ) {
				return;
			}

			const blockDomElement = iframeDocument.getElementById( idAttribute );
			if ( ! blockDomElement ) {
				return;
			}

			blockDomReference.current = blockDomElement;
		}, [ clientId ] );

		/*
		 * Hide the Assistant when
		 * - unmounting,
		 * - block is not deselected.
		 */
		useEffect( () => {
			if ( isSelected ) {
				return;
			}

			hideAssistant();

			return () => {
				hideAssistant();
			};
		}, [ hideAssistant, isSelected ] );

		const setContent = useCallback(
			( newContent: string ) => {
				const newContentBlocks = parse( newContent );

				// Check if the generated blocks are valid.
				const validBlocks = newContentBlocks.filter( block => {
					return block.isValid && block.name !== 'core/freeform';
				} );
				// Only update the valid blocks
				replaceInnerBlocks( clientId, validBlocks );
			},
			[ clientId, replaceInnerBlocks ]
		);

		const postId = useSelect( select => select( 'core/editor' ).getCurrentPostId(), [] );

		const { requestSuggestion } = useAiContext( {
			onSuggestion: setContent,
			askQuestionOptions: {
				postId,
			},
			onDone: doneContent => {
				setContent( doneContent );
			},
		} );

		// Build the context value to pass to the provider.
		const contextValue = useMemo(
			() => ( {
				isAssistantShown,
				showAssistant,
				hideAssistant,
				toggleAssistant,

				isAssistantMenuShown,
				showAssistantMenu,
				hideAssistantMenu,
			} ),
			[
				isAssistantShown,
				showAssistant,
				hideAssistant,
				toggleAssistant,
				isAssistantMenuShown,
				showAssistantMenu,
				hideAssistantMenu,
			]
		);

		if ( ! isPossibleToExtendBlock() ) {
			return <BlockListBlock { ...props } />;
		}

		// Check if the block is listed to be extended.
		if ( EXTENDED_BLOCKS.indexOf( props.name ) === -1 ) {
			return <BlockListBlock { ...props } />;
		}

		return (
			<AiAssistantUiContextProvider value={ contextValue }>
				<KeyboardShortcuts
					shortcuts={ {
						'mod+/': () => {
							toggleAssistant();
							showAssistantMenu();
						},
					} }
				>
					<AiAssistantPopover
						anchor={ blockDomReference?.current }
						show={ isAssistantShown }
						// promptValue={ prompt }
						onPromptChange={ () => {
							// const newPrompt = getPrompt( promptType, { ...options, content } );
							// console.log( { newPrompt } );
							// requestSuggestion( newPrompt );
						} }
						onRequest={ message => {
							const pr = getPrompt( PROMPT_TYPE_JETPACK_FORM_CUSTOM_PROMPT, {
								request: message,
								content,
							} );

							requestSuggestion( pr );
						} }
					/>

					<BlockListBlock { ...props } />
				</KeyboardShortcuts>
			</AiAssistantUiContextProvider>
		);
	};
}, 'withAiAssistantExtension' );

export const withAiAssistantToolbarButton = createHigherOrderComponent(
	BlockEdit => props => {
		const blockControlsProps = {
			group: 'block',
		};
		return (
			<>
				<BlockEdit { ...props } />

				<BlockControls { ...blockControlsProps }>
					<AiAssistantToobarButton requestingState="iddle" />
				</BlockControls>
			</>
		);
	},
	'withAiAssistantToolbarButton'
);

export default withAiAssistantExtension;