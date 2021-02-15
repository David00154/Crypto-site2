 <script>
     import axios from "axios";
 </script>
 
 <!--Container-->
 <div>
 <div class="container w-full mx-auto pt-20">

    <div class="w-full px-4 md:px-0 md:mt-8 mb-16 text-gray-800 leading-normal">

        <!--Console Content-->

        <div class="flex flex-wrap">
            <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                <!--Metric Card-->
                <div class="bg-white border rounded shadow p-2">
                    <div class="flex flex-row items-center">
                        <div class="flex-shrink pr-4">
                            <div class="rounded p-3 bg-green-600"><i class="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div>
                        </div>
                        <div class="flex-1 text-right md:text-center">
                            <h5 class="font-bold uppercase text-gray-500">BTC Wallet</h5>
                            <h3 class="font-bold text-3xl">0 <span class="text-green-500"><i class="fas fa-caret-up"></i></span></h3>
                        </div>
                    </div>
                </div>
                <!--/Metric Card-->
            </div>
            <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                <!--Metric Card-->
                <div class="bg-white border rounded shadow p-2">
                    <div class="flex flex-row items-center">
                        <div class="flex-shrink pr-4">
                            <div class="rounded p-3 bg-green-600"><i class="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div>
                        </div>
                        <div class="flex-1 text-right md:text-center">
                            <h5 class="font-bold uppercase text-gray-500">Total BTC Earnings</h5>
                            <h3 class="font-bold text-3xl">
                                {#await fetch('https://gql-2.vercel.app/api/earning/38', {
                                    method: 'GET',
                                    headers: {'Content-Type':'application/json'}
                                })
                                .then(res => res.json())}
                                    <p>...waiting</p>
                                {:then result}
                                    ${result.data}
                                {:catch error}
                                    <p style="color: red">{error.message}</p>
                                {/await}
                                <span class="text-green-500"><i class="fas fa-caret-up"></i></span></h3>
                        </div>
                    </div>
                </div>
                <!--/Metric Card-->
            </div>
            <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                <!--Metric Card-->
                <div class="bg-white border rounded shadow p-2">
                    <div class="flex flex-row items-center">
                        <div class="flex-shrink pr-4">
                            <div class="rounded p-3 bg-pink-600"><i class="fas fa-shopping_cart fa-2x fa-fw fa-inverse"></i></div>
                        </div>
                        <div class="flex-1 text-right md:text-center">
                            <h5 class="font-bold uppercase text-gray-500">All Withdrawals</h5>
                            <h3 class="font-bold text-3xl">$0 <span class="text-pink-500"><i class="fas fa-exchange-alt"></i></span></h3>
                        </div>
                    </div>
                </div>
                <!--/Metric Card-->
            </div>
            <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                <!--Metric Card-->
                <div class="bg-white border rounded shadow p-2">
                    <div class="flex flex-row items-center">
                        <div class="flex-shrink pr-4">
                            <div class="rounded p-3 bg-red-600"><i class="fas fa-inbox fa-2x fa-fw fa-inverse"></i></div>
                        </div>
                        <div class="flex-1 text-right md:text-center">
                            <h5 class="font-bold uppercase text-gray-500">Btc Wallet Address</h5>
                            <h3 class="font-bold text-3xl">xxxxxxx <span class="text-red-500"><i class="fas fa-caret-up"></i></span></h3>
                        </div>
                    </div>
                </div>
                <!--/Metric Card-->
            </div>
            <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                <!--Metric Card-->
                <div class="bg-white border rounded shadow p-2">
                    <div class="flex flex-row items-center">
                        <div class="flex-shrink pr-4">
                            <div class="rounded p-3 bg-blue-600"><i class="fas fa-server fa-2x fa-fw fa-inverse"></i></div>
                        </div>
                        <div class="flex-1 text-right md:text-center">
                            <h5 class="font-bold uppercase text-gray-500">Server Uptime</h5>
                            <h3 class="font-bold text-3xl">24 hours</h3>
                        </div>
                    </div>
                </div>
                <!--/Metric Card-->
            </div>
            <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                <!--Metric Card-->
                <!-- <div class="bg-white border rounded shadow p-2">
                    <div class="flex flex-row items-center">
                        <div class="flex-shrink pr-4">
                            <div class="rounded p-3 bg-indigo-600"><i class="fas fa-tasks fa-2x fa-fw fa-inverse"></i></div>
                        </div>
                        <div class="flex-1 text-right md:text-center">
                            <h5 class="font-bold uppercase text-gray-500">To Do List</h5>
                            <h3 class="font-bold text-3xl">7 tasks</h3>
                        </div>
                    </div> -->
                </div>
                <!--/Metric Card-->
            </div>
            <div class="w-full md:w-1/2 xl:w-1/3 p-3">
                <!--Metric Card-->
                <!-- <div class="bg-white border rounded shadow p-2">
                    <div class="flex flex-row items-center">
                        <div class="flex-shrink pr-4">
                            <div class="rounded p-3 bg-red-600"><i class="fas fa-inbox fa-2x fa-fw fa-inverse"></i></div>
                        </div>
                        <div class="flex-1 text-right md:text-center">
                            <h5 class="font-bold uppercase text-gray-500">Btc Wallet Address</h5>
                            <h3 class="font-bold text-3xl">xxxxxxx <span class="text-red-500"><i class="fas fa-caret-up"></i></span></h3>
                        </div>
                    </div>
                </div> -->
                <!--/Metric Card-->
            </div>
        </div>

        <!--Divider-->
        <hr class="border-b-2 border-gray-400 mx-4">

        <div class="border border-gray-500 px-3 py-3 mb-5">
            <div id="tradingview_73384">
                <div id="tradingview_efef3-wrapper" style="position: relative;box-sizing: content-box;width: 100%;height: 320px;margin: 0 auto !important;padding: 0 !important;font-family:Arial,sans-serif;">
                    <div style="width: 100%;height: 320px;background: transparent;padding: 0 !important;">
                        <iframe id="tradingview_efef3" src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_efef3&amp;symbol=BITSTAMP%3ABTCUSD&amp;interval=1&amp;hidesidetoolbar=0&amp;symboledit=1&amp;saveimage=1&amp;toolbarbg=f1f3f6&amp;details=1&amp;calendar=1&amp;hotlist=1&amp;studies=%5B%5D&amp;theme=Light&amp;style=1&amp;timezone=Etc%2FUTC&amp;withdateranges=1&amp;studies_overrides=%7B%7D&amp;overrides=%7B%7D&amp;enabled_features=%5B%5D&amp;disabled_features=%5B%5D&amp;locale=en&amp;utm_source=anyoption.online&amp;utm_medium=widget&amp;utm_campaign=chart&amp;utm_term=BITSTAMP%3ABTCUSD" style="width: 100%; height: 100%; margin: 0 !important; padding: 0 !important;" frameborder="0" allowtransparency="true" scrolling="no" allowfullscreen="">
                    </iframe>
                </div>
            </div>
            </div>
        </div>

        <div class="border border-gray-500 px-3 py-3 mb-4">
            <h4 class="text-lg text-gray-500 py-4">Exchange Market</h4>

            <div class="tradingview-widget-container" style="width: 100%; height: 540px;">
                <iframe allowtransparency="true" frameborder="0" src="https://s.tradingview.com/embed-widget/crypto-mkt-screener/?locale=en#%7B%22width%22%3A%22100%25%22%2C%22height%22%3A540%2C%22defaultColumn%22%3A%22overview%22%2C%22screener_type%22%3A%22crypto_mkt%22%2C%22displayCurrency%22%3A%22USD%22%2C%22colorTheme%22%3A%22light%22%2C%22market%22%3A%22crypto%22%2C%22enableScrolling%22%3Atrue%2C%22utm_source%22%3A%22anyoption.online%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22cryptomktscreener%22%7D" style="box-sizing: border-box; height: 540px; width: 100%;"></iframe>
                
              <style>
                  .tradingview-widget-copyright {
                      font-size: 13px !important;
                      line-height: 32px !important;
                      text-align: center !important;
                      vertical-align: middle !important;
                      font-family: 'Trebuchet MS', Arial, sans-serif !important;
                      color: #9db2bd !important;
                  }
              
                  .tradingview-widget-copyright .blue-text {
                      color: #2196f3 !important;
                  }
              
                  .tradingview-widget-copyright a {
                      text-decoration: none !important;
                      color: #9db2bd !important;
                  }
              
                  .tradingview-widget-copyright a:visited {
                      color: #9db2bd !important;
                  }
              
                  .tradingview-widget-copyright a:hover .blue-text {
                      color: #38acdb !important;
                  }
              
                  .tradingview-widget-copyright a:active .blue-text {
                      color: #299dcd !important;
                  }
              
                  .tradingview-widget-copyright a:visited .blue-text {
                      color: #2196f3 !important;
                  }
                  </style></div>
        </div>

    <button class="px-3 py-4 bg-white text-center text-white text-xl mb-4 flex flex-row items-center rounded border border-gray-500">
        <div class="flex-shrink pr-4">
            <div class="rounded p-3 bg-green-600"><i class="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div>
        </div>
        <div class="flex-1 text-right md:text-center">
            <h4 class="font-bold uppercase text-black">Withdraw</h4>
        </div>
    </button>

    <!-- <div class="bg-white border rounded shadow p-2">
        <div class="flex flex-row items-center">
            <div class="flex-shrink pr-4">
                <div class="rounded p-3 bg-green-600"><i class="fa fa-wallet fa-2x fa-fw fa-inverse"></i></div>
            </div>
            <div class="flex-1 text-right md:text-center">
                <h5 class="font-bold uppercase text-gray-500">BTC Wallet</h5>
                <h3 class="font-bold text-3xl">0 <span class="text-green-500"><i class="fas fa-caret-up"></i></span></h3>
            </div>
        </div>
    </div> -->

    

        <!--/ Console Content-->

    </div>


</div>
<!--/container-->