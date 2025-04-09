export const initialFilters = {
  success: true,
  data: {
    status: {
      values: {
        published_bidding: 'Объявленные',
        prepare_bidding: 'Подготовка к торгам',
      },
    },
    search: [],
    subject_rf: {
      values: {
        '75_168': 'Забайкальский край',
        '55_148': 'Омская область',
        '77_495': 'Москва',
        '78_812': 'Санкт-Петербург',
      },
      structure: {
        'Сибирский ФО': {
          '55_148': 'Омская область',
        },
        'Дальневосточный ФО': {
          '75_168': 'Забайкальский край',
        },
        'Центральный ФО': {
          '77_495': 'Москва',
        },
        'Северо-Западный ФО': {
          '78_812': 'Санкт-Петербург',
        },
      },
      url: {
        '55_148': 'omsk-region',
        '75_168': 'trans-baikal-territory',
        '77_495': 'moscow',
        '78_812': 'saint-petersburg',
      },
    },
    complex: {
      values: {
        535663: 'ЖК Солнечный',
        535665: 'ЖК Прибрежный',
        535667: 'Бизнес-центр Сфера',
      },
    },
    'planning-quarter': {
      values: {
        q1_2023: 'Q1 2023',
        q2_2023: 'Q2 2023',
        q3_2023: 'Q3 2023',
        q4_2023: 'Q4 2023',
      },
    },
    'date-request-end': {
      from: {
        min: '01.04.2025',
      },
      to: {
        max: '30.04.2025',
      },
    },
    square: {
      from: {
        min: 70.45,
      },
      to: {
        max: 1001,
      },
    },
    price: {
      from: {
        min: '99',
      },
      to: {
        max: '999999999',
      },
    },
    fo: {
      values: {
        'tsentralny-fo': 'Центральный ФО',
        'severo-zapadny-fo': 'Северо-Западный ФО',
        'sibirskiy-fo': 'Сибирский ФО',
        'dalnevostochny-fo': 'Дальневосточный ФО',
      },
    },
  },
}

export const initialRenderList = {
  success: true,
  data: [
    {
      id: '535668',
      name: 'Коммерческое помещение в ЖК Солнечный',
      url: '/commercial-premises/535668/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Объявленный',
        date_request_end: '30.04.2025',
        planning_quarter: '',
        price: '2800000',
        bidding_number: 'A23/322',
        square: '85.5',
      },
    },
    {
      id: '535664',
      name: 'Офисное помещение на 1 этаже',
      url: '/commercial-premises/535664/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Подготовка к торгам',
        date_request_end: '',
        planning_quarter: 'Q2 2023',
        price: '1500000',
        bidding_number: '',
        square: '72.3',
      },
    },
    {
      id: '535666',
      name: 'Торговое помещение с отдельным входом',
      url: '/commercial-premises/535666/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Подготовка к торгам',
        date_request_end: '',
        planning_quarter: 'Q3 2023',
        price: '3200000',
        bidding_number: '',
        square: '110.8',
      },
    },
    {
      id: '535669',
      name: 'Офис в бизнес-центре класса A',
      url: '/commercial-premises/535669/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Объявленный',
        date_request_end: '15.06.2025',
        planning_quarter: '',
        price: '4500000',
        bidding_number: 'B24/178',
        square: '120.0',
      },
    },
    {
      id: '535670',
      name: 'Торговая площадь в ТЦ',
      url: '/commercial-premises/535670/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Объявленный',
        date_request_end: '10.05.2025',
        planning_quarter: '',
        price: '2100000',
        bidding_number: 'C23/456',
        square: '95.2',
      },
    },
    {
      id: '535671',
      name: 'Помещение под ресторан',
      url: '/commercial-premises/535671/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Подготовка к торгам',
        date_request_end: '',
        planning_quarter: 'Q4 2023',
        price: '3800000',
        bidding_number: '',
        square: '125.0',
      },
    },
    {
      id: '535663',
      name: 'ЖК Солнечный',
      url: '/commercial-premises/project/535663/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Объявленный',
        date_request_end: '30.06.2025',
        planning_quarter: '',
        price: '15000000',
        bidding_number: 'P23/001',
        square: '800.0',
      },
    },
    {
      id: '535665',
      name: 'ЖК Прибрежный',
      url: '/commercial-premises/project/535665/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Подготовка к торгам',
        date_request_end: '',
        planning_quarter: 'Q2 2023',
        price: '12500000',
        bidding_number: '',
        square: '750.0',
      },
    },
    {
      id: '535667',
      name: 'Бизнес-центр Сфера',
      url: '/commercial-premises/project/535667/',
      picture: '/api/placeholder/400/250',
      props: {
        status: 'Объявленный',
        date_request_end: '15.08.2025',
        planning_quarter: '',
        price: '25000000',
        bidding_number: 'P23/045',
        square: '1200.0',
      },
    },
  ],
  nav: {
    NavNum: 1,
    NavPageSize: 12,
    NavPageCount: 1,
    NavPageNomer: 1,
    NavRecordCount: 9,
  },
  meta: {
    page: {
      title: 'Коммерческие помещения от ДОМ.РФ',
    },
    content: {
      title: 'Демонстрационный каталог помещений',
    },
  },
}
