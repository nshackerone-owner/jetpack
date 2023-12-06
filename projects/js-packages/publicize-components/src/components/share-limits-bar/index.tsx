import { RecordMeterBar, Text } from '@automattic/jetpack-components';
import { useMemo } from '@wordpress/element';
import { __, _x } from '@wordpress/i18n';
import classNames from 'classnames';
import { ShareLimits } from '../../hooks/use-share-limits';
import styles from './styles.module.scss';

type NoticeType = ShareLimits[ 'noticeType' ];

export type ShareLimitsBarProps = {
	usedCount: number;
	scheduledCount: number;
	remainingCount?: number;
	text?: string;
	textVariant?: string;
	className?: string;
	noticeType?: NoticeType;
};

const colorsForUsed: Record< NoticeType, string > = {
	error: 'var(--jp-red-50)',
	warning: 'var(--jp-yellow-20)',
	default: 'var(--jp-green)',
};

const colorsForScheduled: Record< NoticeType, string > = {
	error: 'var(--jp-red-50)',
	warning: 'var(--jp-yellow-20)',
	default: 'var(--jp-green-5)',
};

export const ShareLimitsBar = ( {
	usedCount,
	scheduledCount,
	remainingCount,
	text,
	textVariant = 'body',
	className,
	noticeType = 'default',
}: ShareLimitsBarProps ) => {
	const items = useMemo( () => {
		const scheduledMessage = __( 'scheduled', 'jetpack' );
		const usedAndScheduledMessage = __( 'used or scheduled', 'jetpack' );
		return [
			( noticeType === 'default' || scheduledCount === 0 ) && {
				count: usedCount,
				backgroundColor: colorsForUsed[ noticeType ],
				label: __( 'used', 'jetpack' ),
			},
			scheduledCount > 0 && {
				count: noticeType === 'default' ? scheduledCount : scheduledCount + usedCount,
				backgroundColor: colorsForScheduled[ noticeType ],
				label: noticeType === 'default' ? scheduledMessage : usedAndScheduledMessage,
			},
			{
				count: remainingCount,
				backgroundColor: 'var(--jp-gray-off)',
				label: _x(
					'left',
					'Referring to the quantity remaning, not the direction - left/right.',
					'jetpack'
				),
			},
		].filter( Boolean );
	}, [ usedCount, noticeType, scheduledCount, remainingCount ] );

	return (
		<div className={ classNames( styles.wrapper, className ) }>
			{ text ? (
				<Text variant={ textVariant } className={ styles.text }>
					{ text }
				</Text>
			) : null }
			<RecordMeterBar
				totalCount={ usedCount + scheduledCount + remainingCount }
				items={ items }
				className={ styles[ 'bar-wrapper' ] }
			/>
		</div>
	);
};
