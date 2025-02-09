import { PackDistributionType } from '@j0nnyboi/common';
import React, { memo, ReactElement } from 'react';
import { Input, Tooltip } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import classNames from 'classnames';

import ItemRow from '../ItemRow';
import SelectCard from '../SelectCard';

import { AdjustQuantitiesStepProps, InputType } from './interface';
import { DISTRIBUTION_TYPES_DATA } from './data';
import { SafetyDepositDraft } from '../../../../actions/createAuctionManager';

const AdjustQuantitiesStep = ({
  allowedAmountToRedeem,
  distributionType,
  weightByMetadataKey,
  supplyByMetadataKey,
  selectedItems,
  setPackState,
  isUnlimited,
}: AdjustQuantitiesStepProps): ReactElement => {
  const availableDistributionTypes = [
    ...(isUnlimited ? [PackDistributionType.Unlimited] : []),
    PackDistributionType.MaxSupply,
    PackDistributionType.Fixed,
  ];

  const shouldRenderSupplyInput =
    distributionType !== PackDistributionType.Unlimited;
  const shouldRenderWeightInput =
    distributionType !== PackDistributionType.MaxSupply;

  const handleRedeemAmountChange = (value: string): void => {
    setPackState({
      allowedAmountToRedeem: parseInt(value),
    });
  };

  const handleDistributionChange = (
    item: SafetyDepositDraft,
    value: string,
    inputType: InputType,
  ): void => {
    const number = Number(value);
    const pubKey = item.metadata.pubkey;

    if (inputType === InputType.weight && number > 100) {
      return;
    }

    if (inputType === InputType.weight) {
      return setPackState({
        weightByMetadataKey: {
          ...weightByMetadataKey,
          [pubKey]: number,
        },
      });
    }

    const maxSupply = item.masterEdition?.info.maxSupply?.toNumber();
    setPackState({
      supplyByMetadataKey: {
        ...supplyByMetadataKey,
        [pubKey]:
          maxSupply !== undefined && number > maxSupply ? maxSupply : number,
      },
    });
  };

  const handleDistributionTypeChange = (type: PackDistributionType): void => {
    setPackState({ distributionType: type });
  };

  return (
    <div className="quantities-step-wrapper">
      <p className="quantities-step-wrapper__title">
        Set number of cards in pack
      </p>
      <p className="quantities-step-wrapper__subtitle">
        Number of times user can redeem a card using a single voucher.
      </p>
      <Input
        className="quantities-step-wrapper__input"
        type="number"
        value={allowedAmountToRedeem}
        onChange={({ target: { value } }) => handleRedeemAmountChange(value)}
      />

      <p className="quantities-step-wrapper__title">Select distribution type</p>
      <div className="cards-select">
        {availableDistributionTypes.map(type => (
          <SelectCard
            key={type}
            title={DISTRIBUTION_TYPES_DATA[type].title}
            subtitle={DISTRIBUTION_TYPES_DATA[type].subtitle}
            isSelected={distributionType === type}
            onClick={() => handleDistributionTypeChange(type)}
          />
        ))}
      </div>

      <div className="quantities-step-wrapper__table-titles">
        {shouldRenderSupplyInput && <p>NUMBER OF NFTs</p>}
        {shouldRenderWeightInput && (
          <p className="redeem-weight">
            REDEEM WEIGHT{' '}
            <span>
              — Weights must be between 1-100. 1 is least likely, 100 is most
              likely.
            </span>
          </p>
        )}
      </div>

      {Object.values(selectedItems).map(item => (
        <ItemRow key={item.metadata.pubkey} item={item}>
          <>
            {shouldRenderSupplyInput && (
              <div className="input-column">
                <Input
                  type="number"
                  min={0}
                  max={item.masterEdition?.info.maxSupply?.toNumber()}
                  className={classNames({
                    'ant-error-input':
                      !supplyByMetadataKey[item.metadata.pubkey],
                  })}
                  value={supplyByMetadataKey[item.metadata.pubkey]}
                  onChange={({ target: { value } }) =>
                    handleDistributionChange(item, value, InputType.maxSupply)
                  }
                />
              </div>
            )}
            {shouldRenderWeightInput && (
              <div className="input-column">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={weightByMetadataKey[item.metadata.pubkey]}
                  onChange={({ target: { value } }) =>
                    handleDistributionChange(item, value, InputType.weight)
                  }
                  className={classNames({
                    'ant-error-input error-redeem':
                      !weightByMetadataKey[item.metadata.pubkey],
                  })}
                />
                {!weightByMetadataKey[item.metadata.pubkey] && (
                  <div className="error-tooltip-container">
                    <Tooltip
                      overlayClassName="creat-pack-redeem-tooltip"
                      placement="top"
                      title="Weight must be between 1-100"
                    >
                      <ExclamationCircleOutlined className="input-info" />
                    </Tooltip>
                  </div>
                )}
              </div>
            )}
          </>
        </ItemRow>
      ))}
    </div>
  );
};

export default memo(AdjustQuantitiesStep);
