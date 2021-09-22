import { Injectable } from '@angular/core';
import { ModalService } from '@epgu/ui/services/modal';
import { DsPlugin } from './ds.plugin';
import { EdsItem } from '@epgu/ui/models';
import { EdsItemsComponent } from '@epgu/ui/components/ds-widget/eds-items';
import { EdsPinComponent } from '@epgu/ui/components/ds-widget/eds-pin';
import { EdsLoaderComponent } from '@epgu/ui/components/ds-widget/eds-loader';
import { EdsErrorComponent } from '@epgu/ui/components/ds-widget/eds-error';

import '@ifc/plugin';
import '@ifc/common';

declare const window: any;

const DELAY = 2000;

@Injectable({
  providedIn: 'root'
})
export class DsWidget {
  public instance;
  public configuration: any = {};
  public certs = [];
  public ifcPlugin;

  constructor(
    private modalService: ModalService,
    private dsPlugin: DsPlugin
  ) { }

  private static checkPin(pin) {
    if (pin == null || pin.trim().length === 0) {
      throw new Error('ds_plugin_bad_pin');
    }
  }

  private static removeIfc(plugin: any): void {
    if (typeof plugin === 'object' && plugin.parentNode) {
      plugin.parentNode.removeChild(plugin);
    } else if (plugin) {
      document.body.removeChild(plugin);
    }
  }

  private static isChromeConnector(): boolean {
    const includeArr = ['Firefox/', 'Chrome', 'Opera', 'Edge', 'YaBrowser'];
    const ua = navigator.userAgent;

    let inGoogleChrome = false;

    for (const browser of includeArr) {
      if ((ua.search(browser) !== -1) && (browser === 'Firefox/')) {
        let pos = ua.indexOf(browser);
        pos += 8;
        let startStr = ua.substr(pos);
        if (startStr) {
          const endPos = startStr.indexOf(' ');
          startStr = endPos !== -1 ? startStr.substring(0, endPos) : startStr;
          const version = startStr ? parseInt(startStr, 10) : 0;
          if (version >= 50) {
            inGoogleChrome = true;
          }
        }
        break;
      }
      if (ua.search(browser) !== -1) {
        inGoogleChrome = true;
        break;
      }
    }

    return inGoogleChrome;
  }

  private static dsPluginErrorHandler(e, failed) {
    switch (e) {
      case 'ds_plugin_not_found':
        failed({code: 'plugin_not_found'});
        break;
      case 'ds_plugin_internal':
        failed({code: 'internal'});
        break;
      case 'ds_plugin_container_not_found':
        failed({code: 'container_not_found'});
        break;
      case 'ds_plugin_process_interrupted':
        failed({code: 'process_interrupted'});
        break;
      default:
        throw e;
    }
  }

  private static normalizeVersionOctet(octet) {
    if (octet !== undefined && octet != null) {
      return '000'.substring(0, 3 - octet.length) + octet;
    }
    return '000';
  }

  private static normalizeVersion(version) {
    const octets = version !== undefined && version != null ? version.split('.') : [];
    let versionString = '1';

    for (let i = 0; i < 4; i++) {
      versionString = versionString + DsWidget.normalizeVersionOctet(octets[i]);
    }

    return parseInt(versionString, 10);
  }

  private static parseDate(str) {
    const date = new Date(str);
    const day = date.getUTCDate();
    const month = date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();

    return (day > 9 ? day : '0' + day) + '.' + (month > 9 ? month : '0' + month) + '.' + year;
  }

  public version(): any {
    if (!this.instance) {
      this.dsPlugin.init();
    }
    return {
      version: this.version,
      crts: this.certs,
      sign: this.sign
    };
  }

  public checkPlugin(success, failed, requiredVersion) {
    this.disclaimerDialog();
    setTimeout(() => {
      this.modalService.destroyForm();
      this.initIFCPlugin(data => {
        this.certs = data.certs;
        success({version: data.version});
      }, () => {
        this.ifcPlugin = null;
        try {
          const pluginVersion = this.dsPlugin.version();
          console.log(pluginVersion);
          if (DsWidget.normalizeVersion(pluginVersion) >= DsWidget.normalizeVersion(requiredVersion)) {
            success({version: pluginVersion});
          } else {
            this.errorDialog('old_version');
          }
        } catch (e) {
          if (e.message === 'ds_plugin_not_found') {
            this.errorDialog('not_found');
          } else {
            DsWidget.dsPluginErrorHandler(e, failed);
          }
        }
      });
    },  DELAY);
  }

  public listDialog(success, failed) {
    setTimeout(() => {
      let crts;

      try {
        crts = this.ifcPlugin ? this.certs : this.dsPlugin.crts();
        this.modalService.destroyForm();
      } catch (e) {
        this.modalService.destroyForm();
        DsWidget.dsPluginErrorHandler(e, failed);
        return;
      }

      this.modalService.popupInject(EdsItemsComponent, null, {
        items: crts.map((item, index): EdsItem => {
          return {
            index,
            commonName: this.ifcPlugin ? item.getSubjectDN().getCommonName() : item.subject.common_name,
            issuer: this.ifcPlugin ? item.getIssuerDN().getCommonName() : item.issuer.common_name,
            subjectSurname: this.ifcPlugin ? item.getSubjectDN().getSurname() : item.subject.sn,
            subjectName: this.ifcPlugin ? item.getSubjectDN().getGivenName() : item.subject.gn,
            validFrom: this.ifcPlugin ? DsWidget.parseDate(item.getValidFrom()) : item.validity.from,
            validTo: this.ifcPlugin ? DsWidget.parseDate(item.getValidTo()) : item.validity.to
          };
        }),
        select: (index) => {
          if (this.ifcPlugin) {
            this.ifcPlugin.getCertificate(crts[index].getContainerId(), msg => {
              try {
                success({id: crts[index].getContainerId(), certificate: msg.cert});
              } catch (e) {
                console.log('Invalid certificate. Container ID: ' + crts[index].getContainerId());
              }
            });
          } else {
            success({id: crts[index].id, certificate: (crts[index].string)});
          }
        }
      });
    },  DELAY);
  }

  public sign(id, data, success, failed) {
    this.disclaimerDialog();
    let crt;
    let attempts = 3;

    if (this.ifcPlugin) {
      for (const cert of this.certs) {
        if (cert.getContainerId() === id) {
          crt = cert;
        }
      }
    } else {
      try {
        crt = this.dsPlugin.crtInfo(id);
      } catch (e) {
        DsWidget.dsPluginErrorHandler(e, failed);
        return;
      }
    }

    const selected = (pin: string): void => {
      setTimeout(() => {
        try {
          DsWidget.checkPin(pin);

          if (this.ifcPlugin) {
            this.ifcPlugin.signDataCmsAttached(id, pin, data, msg => {
              this.modalService.destroyForm();

              if (window.IFCError.IFC_OK === msg.error_code) {
                success({sign: msg.sign_value});
              } else if (window.IFCError.IFC_BAD_TYPE_PIN === msg.error_code || window.IFCError.IFC_P11_LOGIN_ERROR === msg.error_code) {
                attempts = attempts > 0 ? attempts - 1 : 0;

                this.pinDialog(crt, selected, attempts);
              }
            });
          } else {
            const ds = this.dsPlugin.sign(id, pin, data);
            this.modalService.destroyForm();
            success({sign: ds});
          }

        } catch (e) {
          this.modalService.destroyForm();
          if (e === 'ds_plugin_bad_pin') {
            attempts = attempts > 0 ? attempts - 1 : 0;

            this.pinDialog(crt, selected, attempts);
          } else {
            DsWidget.dsPluginErrorHandler(e, failed);
          }
        }
      }, DELAY);
    };

    setTimeout(() => {
      this.modalService.destroyForm();

      if (this.ifcPlugin) {
        this.pinDialog(crt, selected);
      } else {
        let isPinRequired;

        try {
          isPinRequired = this.dsPlugin.isPinRequired(id);
        } catch (e) {
          DsWidget.dsPluginErrorHandler(e, failed);
          return;
        }

        if (isPinRequired) {
          this.pinDialog(crt, selected);
        } else {
          try {
            success({sign: this.dsPlugin.sign(id, '', data)});
          } catch (e) {
            DsWidget.dsPluginErrorHandler(e, failed);
          }
        }
      }
    },  DELAY);
  }

  public selectAndSign(data, success, failed) {
    this.listDialog(selectResponse => {
      this.sign(selectResponse.id, data, signResponse => {
        signResponse.id = selectResponse.id;
        signResponse.certificate = selectResponse.certificate;
        success(signResponse);
      }, signResponse => {
        failed(signResponse);
      });
    }, selectResponse => {
      failed(selectResponse);
    });
  }

  public selectAndSignJsonXml(json, xml, success, failed) {
    this.listDialog((selectResponse) => {
      this.sign(selectResponse.id, json, jsonPkcs7 => {
        this.sign(selectResponse.id, json, xmlPkcs7 => {
          success({
            jsonPkcs7: jsonPkcs7.sign,
            xmlPkcs7: xmlPkcs7.sign
          });
        }, signResponse => {
          failed(signResponse);
        });
      }, signResponse => {
        failed(signResponse);
      });
    }, selectResponse => {
      failed(selectResponse);
    });
  }

  private initIFCPlugin(callback, errCallback) {
    const ua = navigator.userAgent;
    if (ua.search('Chrome') > -1 || ua.search('Firefox') > -1) {
      if (document.getElementById('ifcplugin-extension-is-installed')) {
        if (document.getElementById('ifc-plugin-is-installed')) {
          this.ifcLoad(true, data => {
            callback(data);
          }, () => {
            errCallback();
          });
        } else {
          errCallback();
        }
      } else {
        errCallback();
      }
    } else {
      this.ifcLoad(DsWidget.isChromeConnector(), data => {
        callback(data);
      }, () => {
        errCallback();
      });
    }
  }

  private ifcLoad(isChromeConnect, callbackSuccess, callbackError) {
    const that = this;
    let plugin;

    plugin = document.createElement('object');
    plugin.setAttribute('id', 'IFCPlugin');
    plugin.setAttribute('height', '1');
    plugin.setAttribute('width', '1');

    if (!isChromeConnect) {
      plugin.setAttribute('type', 'application/x-ifcplugin');
    }

    if (!document.getElementById('IFCPlugin')) {
      document.body.appendChild(plugin);
    }

    this.ifcPlugin = new window.IFCPlugin(document.getElementById('IFCPlugin'), isChromeConnect, true);
    if (this.ifcPlugin) {
      this.disclaimerDialog();
      this.ifcPlugin.create('', '', msg => {
        if (window.IFCError.IFC_OK === msg.error_code) {
          that.ifcPlugin.getPluginVersion(msgVer => {
            if (window.IFCError.IFC_OK === msgVer.error_code) {
              const version = msgVer.version;
              console.log('VERSION: ' + msgVer.version);
              that.ifcPlugin.getCertificateList(msgCrtList => {
                this.modalService.destroyForm();
                let certificates = msgCrtList.certs_list;
                certificates = certificates.filter(item => {
                  return item.isValid();
                });
                console.log('Is valid certificates: ' + certificates);
                callbackSuccess({version, certs: certificates});
                if (!certificates.length) {
                  DsWidget.removeIfc(plugin);
                }
              });
            } else {
              this.modalService.destroyForm();
              DsWidget.removeIfc(plugin);
              callbackError();
            }
          });
        } else {
          this.modalService.destroyForm();
          DsWidget.removeIfc(plugin);
          callbackError();
        }
      });
    } else {
      callbackError();
    }
  }

  private errorDialog(type: 'not_found' | 'old_version') {
    this.modalService.popupInject(EdsErrorComponent, null, { type });
  }

  private pinDialog(crt, success, error?: number) {
    const edsItem: EdsItem = {
      commonName: this.ifcPlugin ? crt.getSubjectDN().getCommonName() : crt.subject.common_name,
      issuer: this.ifcPlugin ? crt.getIssuerDN().getCommonName() : crt.issuer.common_name,
      subjectSurname: this.ifcPlugin ? crt.getSubjectDN().getSurname() : crt.subject.sn,
      subjectName: this.ifcPlugin ? crt.getSubjectDN().getGivenName() : crt.subject.gn,
      validFrom: this.ifcPlugin ? DsWidget.parseDate(crt.getValidFrom()) : crt.validity.from,
      validTo: this.ifcPlugin ? DsWidget.parseDate(crt.getValidTo()) : crt.validity.to
    };

    this.modalService.popupInject(EdsPinComponent, null, {
      error,
      item: edsItem,
      submit: (pin: number) => {
        success(pin);
      }
    });
  }

  private disclaimerDialog() {
    this.modalService.popupInject(EdsLoaderComponent, null);
  }
}
