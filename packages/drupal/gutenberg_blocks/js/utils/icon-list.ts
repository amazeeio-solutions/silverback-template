// HOW TO ADD A NEW ICON.
//
// 1. Add a new icon to the Icons enum.
// 2. Add a new icon to the allIconListOptions function.
// 3. Add icon image to the ICON_IMAGE_PATH.
// 4. Add a new icon to the iconImagePreview function.
//
// Your new icon is now available for selection, it will be displayed everywhere all icons are used.
// Or you can use the limitedIconListOption function to limit the available icons in a specific context.
//
// NOTE: search this file for "*" to find the places where you need to add your new icon.

// *1. Available icons.
export enum Icons {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  LIFE_RING = 'LIFE_RING',
}

// Single icon type.
export type Icon = {
  label: string;
  value: string;
};

// *3. Icon image path.
const ICON_IMAGE_PATH = '/modules/custom/gutenberg_blocks/images/icons/';

/**
 * A list of all icons.
 *
 * @param addDefault
 *  If you want to add a default option.
 * @param defaultLabel
 *  The default label.
 * @param defaultValue
 *  The default value.
 */
export const allIconListOptions = (
  addDefault: boolean = true,
  defaultLabel: string = Drupal.t('Select an icon'),
  defaultValue: string = '',
): Icon[] => {
  // Empty array of icons.
  let allIcons: Icon[] = [];

  // *2. The list of all icons.
  allIcons = [
    {
      label: Drupal.t('Email'),
      value: Icons.EMAIL,
    },
    {
      label: Drupal.t('Telephone'),
      value: Icons.PHONE,
    },
    {
      label: Drupal.t('Life Ring'),
      value: Icons.LIFE_RING,
    },
  ];

  // If using default add to first place.
  if (addDefault) {
    allIcons.unshift({
      label: defaultLabel,
      value: defaultValue,
    });
  }

  return allIcons;
};

/**
 * Creates an icon image preview.
 *
 * @param icon
 *  The icon to be displayed.
 */
export const iconImagePreview = (icon: string): string => {
  let iconFileName = '';

  switch (icon) {
    case Icons.EMAIL:
      iconFileName = 'email.svg';
      break;
    case Icons.PHONE:
      iconFileName = 'phone.svg';
      break;
    case Icons.LIFE_RING:
      iconFileName = 'life-ring.svg';
      break;
  }

  if (!iconFileName) {
    return '';
  }

  return ICON_IMAGE_PATH + iconFileName;
};

/**
 * Limited icon list option.
 *
 * @param icons
 *  The list of icons to be displayed.
 * @param addDefault
 *  If you want to add a default option.
 * @param defaultLabel
 *  The default label.
 * @param defaultValue
 *  The default value.
 */
export const limitedIconListOption = (
  icons: Icons[],
  addDefault: boolean = true,
  defaultLabel: string = Drupal.t('Select an icon'),
  defaultValue: string = '',
): Icon[] => {
  if (addDefault) {
    icons.unshift(defaultValue as Icons);
  }

  return allIconListOptions(addDefault, defaultLabel, defaultValue).filter(
    (icon) => icons.includes(icon.value as Icons),
  );
};
