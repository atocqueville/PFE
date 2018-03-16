export class ConfigModel {
  constructor(config) {
    this.currency = config.currency;
    this.timestamp = config.timestamp;
    this.RSIperiod = config.RSIperiod;
    this.walletUsed = config.walletUsed;
    this.minRSI = config.minRSI;
    this.maxRSI = config.maxRSI;
  }
}