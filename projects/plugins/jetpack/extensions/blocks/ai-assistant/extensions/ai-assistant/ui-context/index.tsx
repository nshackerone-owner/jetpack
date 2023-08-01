/**
 * External dependencies
 */
import { createContext } from '@wordpress/element';

type AiAssistantUiContextProps = {
	// Dialog visibility
	isAssistantShown: boolean;
	showAssistant: () => void;
	hideAssistant: () => void;
	toggleAssistant: () => void;

	isAssistantMenuShown: boolean;
	hideAssistantMenu: () => void;
};

type AiAssistantUiContextProviderProps = {
	/*
	 * Open the AI Assistant
	 */
	value: AiAssistantUiContextProps;

	/*
	 * Children
	 */
	children: React.ReactNode;
};

/**
 * Ai Assistant Context
 */
export const AiAssistantUiContext = createContext( {} as AiAssistantUiContextProps );

export const AiAssistantUiContextProvider = ( {
	value,
	children,
}: AiAssistantUiContextProviderProps ) => (
	<AiAssistantUiContext.Provider value={ value } children={ children } />
);