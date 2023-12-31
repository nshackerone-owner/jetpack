import { Container, Col, Button, Text } from '@automattic/jetpack-components';
import { __ } from '@wordpress/i18n';
import { close } from '@wordpress/icons';
import { useEffect, useCallback, useState } from 'react';
import useAnalytics from '../../hooks/use-analytics';
import useWelcomeBanner from '../../hooks/use-welcome-banner';
import { CardWrapper } from '../card';
import styles from './style.module.scss';

/**
 * Component that renders the Welcome banner on My Jetpack.
 *
 * @returns {object} The WelcomeBanner component.
 */
const WelcomeBanner = () => {
	const { recordEvent } = useAnalytics();
	const { hasBeenDismissed, dismissWelcomeBanner } = useWelcomeBanner();
	const [ bannerVisible, setBannerVisible ] = useState( ! hasBeenDismissed );

	useEffect( () => {
		if ( bannerVisible ) {
			recordEvent( 'jetpack_myjetpack_welcome_banner_view' );
		}
	}, [ bannerVisible, recordEvent ] );

	const onDismissClick = useCallback( () => {
		recordEvent( 'jetpack_myjetpack_welcome_banner_dismiss_click' );
		setBannerVisible( false );
		dismissWelcomeBanner();
	}, [ recordEvent, dismissWelcomeBanner ] );

	if ( ! bannerVisible ) {
		return null;
	}

	return (
		<Container horizontalSpacing={ 3 } className={ styles[ 'banner-container' ] }>
			<Col lg={ 12 } className={ styles.banner }>
				<CardWrapper className={ styles[ 'banner-card' ] }>
					<Container
						horizontalSpacing={ 0 }
						horizontalGap={ 0 }
						className={ styles[ 'banner-content' ] }
					>
						<Col sm={ 6 } md={ 8 } lg={ 6 } className={ styles[ 'banner-description' ] }>
							<Text variant="headline-small" mb={ 4 }>
								{ __( 'Welcome to Jetpack!', 'jetpack-my-jetpack' ) }
							</Text>
							<Text variant="body" mb={ 3 }>
								{ __(
									'Jetpack is a suite of security, performance, and growth tools made for WordPress sites by the WordPress experts.',
									'jetpack-my-jetpack'
								) }
							</Text>
							<Text variant="body">
								{ __(
									'It’s the ultimate toolkit for best-in-class websites, with everything you need to grow your business. Choose a plan below to get started.',
									'jetpack-my-jetpack'
								) }
							</Text>
						</Col>
						<Col sm={ 6 } md={ 8 } lg={ 6 } className={ styles[ 'banner-image' ] }></Col>
					</Container>
				</CardWrapper>
				<Button
					className={ styles.dismiss }
					title={ __( 'Dismiss', 'jetpack-my-jetpack' ) }
					variant="secondary"
					size="small"
					icon={ close }
					onClick={ onDismissClick }
				/>
			</Col>
		</Container>
	);
};

export default WelcomeBanner;
