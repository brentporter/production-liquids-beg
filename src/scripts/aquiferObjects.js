export class AquiferObject {
    constructor(){}
    nameAquifer;

}

export class tx_aquifer_datapoint {
    constructor() {}
    date;
    orig;
    trend_mean;
    trend_median;
    trend_q025;
    trend_q97;
    annual_mean;
    annual_median;
    annual_q025;
    annual_q97;
    semiannual_mean;
    semiannual_median;
    semiannual_q025;
    semiannual_q97;
    pred_tws_mean;
    pred_tws_q025;
    pred_tws_q97;
    ci95;
    residuals;
    residuals0;
    final_tws_res;
    }

let exampleAquiferDatapoint = new tx_aquifer_datapoint();
    exampleAquiferDatapoint.date = "04/16/2002";
    exampleAquiferDatapoint.orig = 28.15;
    exampleAquiferDatapoint.trend_mean = 34.99;
    exampleAquiferDatapoint.trend_median = 35;
    exampleAquiferDatapoint.trend_q025 = 37.01;
    exampleAquiferDatapoint.trend_q97 = 32.81;
    exampleAquiferDatapoint.annual_mean = 22.12;
    exampleAquiferDatapoint.annual_median = 22.15;
    exampleAquiferDatapoint.annual_q025 = 14.94;
    exampleAquiferDatapoint.annual_q97 = 29;
    exampleAquiferDatapoint.semiannual_mean = -1.23;
    exampleAquiferDatapoint.semiannual_median = -1.45;
    exampleAquiferDatapoint.semiannual_q025 = -7.05;
    exampleAquiferDatapoint.semiannual_q97 = 5.71;
    exampleAquiferDatapoint.pred_tws_mean = 55.89;
    exampleAquiferDatapoint.pred_tws_q025 = 56.71;
    exampleAquiferDatapoint.pred_tws_q97 = 55.77;
    exampleAquiferDatapoint.ci95 = 0.94;
    exampleAquiferDatapoint.residuals = -0.35;
    exampleAquiferDatapoint.residuals0 = -0.35;
    exampleAquiferDatapoint.final_tws_res = 55.54;
