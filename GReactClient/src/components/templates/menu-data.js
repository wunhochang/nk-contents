export default {
    expanded: true,
    text: 'All',
    children: [
              {
                id: '/movieview',
                text: '영화관리',
                iconCls: 'x-fa fa-bar-chart',
                leaf: true
              },
              {
                id: '/servicecorpview',
                text: '서비스업체관리',
                iconCls: 'x-fa fa-bar-chart',
                leaf: true
              },
              {
                id: '/settlementview',
                text: '정산관리',
                iconCls: 'x-fa fa-bar-chart',
                leaf: true
              },
              {
                id: '/settlementtypeview',
                text: '정산서양식관리',
                iconCls: 'x-fa fa-bar-chart',
                leaf: true
              },
              {
                id: '/commoncodeview',
                text: '공통코드관리',
                iconCls: 'x-fa fa-bar-chart',
                leaf: true
              },
        // {
        //     text: '정산관리',
        //     iconCls: 'x-fa fa-home',
        //     children: [
        //     {
        //           id: '/injuryrecord',
        //           text: '업체별 정산등록',
        //           iconCls: 'x-fa fa-bar-chart',
        //           leaf: true
        //       },
        //       {
        //           id: '',
        //           text: '업체별 정산관리',
        //           iconCls: 'x-fa fa-info',
        //           children: [
        //             {
        //                 id: '/securityworkpermission',
        //                 text: '정산현황',
        //                 iconCls: 'fa fa-thumbs-o-up',
        //                 leaf: true
        //             },
        //             {
        //                 id: '/servicecorpview',
        //                 text: '서비스업체관리',
        //                 iconCls: 'fa fa-thumbs-o-up',
        //                 leaf: true
        //             },
        //             // {
        //             //     id: '/securityworker',
        //             //     text: '안전작업자관리',
        //             //     iconCls: 'x-fa fa-user',
        //             //     leaf: true
        //             // },
        //             // {
        //             //     id: '/securityworkereducation',
        //             //     text: '안전작업자교육',
        //             //     iconCls: 'x-fa fa-users',
        //             //     leaf: true
        //             // }
        //           ]
        //       }
        //     ]
        // },
        {
            text: '시스템관리',
            iconCls: 'x-fa fa-home',
            children: [
              {
                  id: '/commoncodeview',
                  text: '기초코드관리',
                  iconCls: 'x-fa fa-bar-chart',
                  leaf: true
              },
              {
                  id: '/menuview',
                  text: '메뉴관리',
                  iconCls: 'x-fa fa-bar-chart',
                  leaf: true
              },
              // {
              //     id: '/injuryrecord',
              //     text: 'VOD 영화관리',
              //     iconCls: 'x-fa fa-bar-chart',
              //     leaf: true
              // },
              // {
              //     id: '/injuryrecord',
              //     text: '사용자관리',
              //     iconCls: 'x-fa fa-bar-chart',
              //     leaf: true
              // },
              // {
              //     id: '/injuryrecord',
              //     text: '메뉴관리',
              //     iconCls: 'x-fa fa-bar-chart',
              //     leaf: true
              // },
              // {
              //     id: '/injuryrecord',
              //     text: '역할관리',
              //     iconCls: 'x-fa fa-bar-chart',
              //     leaf: true
              // },
              // {
              //     id: '',
              //     text: '안전작업허가',
              //     iconCls: 'x-fa fa-info',
              //     children: [{
              //         id: '/securityworkpermission',
              //         text: '안전작업허가관리',
              //         iconCls: 'fa fa-thumbs-o-up',
              //         leaf: true
              //     },
              //     {
              //         id: '/securityworker',
              //         text: '안전작업자관리',
              //         iconCls: 'x-fa fa-user',
              //         leaf: true
              //     },
              //     {
              //         id: '/securityworkereducation',
              //         text: '안전작업자교육',
              //         iconCls: 'x-fa fa-users',
              //         leaf: true
              //     }]
              //   }
            ]
        }
    ]
};
