'use strict';

// eslint-disable-next-line no-unused-vars
const config = {
  style: 'mapbox://styles/isaiahcornelius/clqg37fke005y01pz7d7j95wr',
  accessToken:
    'pk.eyJ1IjoiaXNhaWFoY29ybmVsaXVzIiwiYSI6ImNsbzJldHVwdzFmMWEya3FoNGo5ZXoybG8ifQ.P4y494VuvnDyeTQDNtEoDA',
  CSV: './5.6.2024_Investors_for_NCDFIs.csv',
  center: [-117, 48],
  zoom: 1,
  title: 'Investors For NCDFIs',
  description:
    'Investors interested in providing capital to Native Community Development Financial Institutions',
  sideBarInfo: ['Org_Name', 'Address', 'City_ST_Zip'],
  popupLocation_Name: ['Org_Name'],
  popupWebsite: ['Website'],
  popupContactInfo: ['Contact_Info'],
  popupMissionStatement: ['Mission_Statement'],
  popupInvestorType: ['Investor_Type'],
  popupInvestmentsType: ['Investments_Type'],
  popupPairEquityOrGrantsWithInvestments: [
    'Pair_Equity_Or_Grants_With_Investments',
  ],
  popupInvestedInNCDFIPreviously: ['Invested_In_NCDFI_Previously'],
  popupMin: ['Min'],
  popupMax: ['Max'],
  popupInvestmentTerms: ['Investment_Terms_Obj'],
  popupFocusAreas: ['Focus_Areas'],
  popupGeographicAreas: ['Geographic_Areas'],
  filters: [
    {
      type: 'dropdown',
      title: 'State: ',
      columnHeader: 'State',
      listItems: ['CA', 'HI', 'MD', 'MN', 'PA', 'UT', 'VT'],
    },
  ],
};
