require.config({
    paths: {
        'data': './data',
    },
    packages: [
        {
            main: 'ecStat',//往上找到test所在目录 进入src 找到ecStat
            location: '../src',
            name: 'ecStat'
        },
        {
            main: 'echarts',
            location: '../echarts/dist',//html 引用这个config 需要上面那个工具类 结合echarts 我自己粘贴进来一份测试
            name: 'echarts'
        },
        {
            main: 'zrender',
            location: '../../zrender/dist',
            name: 'zrender'
        }
    ]

});