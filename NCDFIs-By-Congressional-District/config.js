'use strict';

// eslint-disable-next-line no-unused-vars
const config = {
  style: 'mapbox://styles/isaiahcornelius/cm8q3uuef00bp01rc7ctqfsqi',
  accessToken:
    'pk.eyJ1IjoiaXNhaWFoY29ybmVsaXVzIiwiYSI6ImNsbzJldHVwdzFmMWEya3FoNGo5ZXoybG8ifQ.P4y494VuvnDyeTQDNtEoDA',
  CSV: './3.12.2025_CertifiedNCDFIs.csv',
  center: [-117, 48],
  zoom: 1,
  title: 'Certified Native CDFIs',
  description:
    'Certified Native Community Development Financial Institutions of the United States of America by Congressional District. Updated 3/21/2025',
  sideBarInfo: ['Location_Name', 'Address', 'City_ST_Zip', 'Phone'],
  popupLocation_Name: ['Location_Name'],
  popupWebsite: ['Website'],
  filters: [
    {
      type: 'dropdown',
      title: 'State: ',
      columnHeader: 'State',
      listItems: [
        'AK',
        'AZ',
        'CA',
        'CO',
        'HI',
        'ID',
        'ME',
        'MI',
        'MN',
        'MS',
        'MT',
        'NC',
        'NE',
        'NM',
        'NY',
        'OK',
        'OR',
        'SD',
        'TX',
        'WA',
        'WI',
        'WY',
      ],
    },
    {
      type: 'checkbox',
      title: 'Financial Institution Type: ',
      columnHeader: 'Financial_Institution_Type', // Case sensitive - must match spreadsheet entry
      listItems: ['Bank', 'Credit Union', 'Loan Fund'], // Case sensitive - must match spreadsheet entry; This will take up to six inputs but is best used with a maximum of three;
    },
  ],
};
