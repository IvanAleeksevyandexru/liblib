import { PipeTransform } from '@angular/core';

// tslint:disable:no-use-before-declare
export const VALUE_KEY = 'inputValue';

/**
 * параметры для цепочки форматирования пайпов в виде простой мапы
 */
export class PipedParameters {

  constructor(parameters?: { [key: string]: any }) {
    this.map = parameters || {};
  }

  public map: { [key: string]: any } | null = null;

  public get(key: string) {
    return this.map ? this.map[key] : '';
  }

  public join(...moreParameters: PipedParameters[]) {
    const paramsToBeJoined = [this.map].concat(moreParameters.map((p) => p.map));
    return new PipedParameters(Object.assign({}, ...paramsToBeJoined));
  }
}

/**
 * сообщение с вьюшным форматированием в комплекте со всеми необходимыми параметрами (параметры могут подмешаны и обновлены)
 */
export class PipedMessage {

  constructor(value: any, template: PipeLine, parameters?: PipedParameters | { [key: string]: any }) {
    this.value = value;
    this.template = template;
    this.parameters = parameters instanceof PipedParameters ? parameters : new PipedParameters(parameters);
  }

  public value: any;
  public template: PipeLine;
  public parameters: PipedParameters = null;

}

/**
 * цепочка пайпов в виде дерева
 */
export class PipeLine {

  constructor(pipes?: Array<PipeInfo | PipeTransform>) {
    this.pipes = pipes || [];
  }

  public pipes: Array<PipeInfo | PipeTransform> = [];

  public static processPipeLine(inputValue: any, pipeLine: PipeLine | PipeArgument, args: PipedParameters): any {
    let result = args.get(VALUE_KEY) || inputValue;
    if (pipeLine && pipeLine.pipes.length) {
      for (const pipeInfo of pipeLine.pipes) {
        if (pipeInfo instanceof PipeInfo || (pipeInfo as any).pipe) {
          const pipeDescriptor = pipeInfo as PipeInfo;
          const pipe = pipeDescriptor.pipe;
          if (pipe) {
            const pipeArgs = (pipeDescriptor.args || []).map((argValueOrDescriptor) => {
              if (argValueOrDescriptor instanceof PipeArgument || argValueOrDescriptor.argName) {
                const argumentDescriptor = argValueOrDescriptor as PipeArgument;
                const argName = argumentDescriptor.argName;
                if (/^\[.*\]$/.test(argName) && Array.isArray(args.get(argName))) {
                  return args.get(argName).map((arg) => PipeLine.processPipeLine(arg, argumentDescriptor, args));
                } else {
                  return PipeLine.processPipeLine(args.get(argName), argumentDescriptor, args);
                }
              } else {
                return argValueOrDescriptor;
              }
            });
            result = pipe.transform.apply(pipe, [result].concat(pipeArgs));
          } else {
            // nothing to do, empty pipe data, skip
          }
        } else {
          result = (pipeInfo as PipeTransform).transform(result);
        }
      }
    }
    return result;
  }
}

/**
 * информация о пайпе в цепочке форматирования
 */
export class PipeInfo {

  public pipeName?: string;
  public args: Array<PipeArgument | any> = [];
  public pipe: PipeTransform;
}

/**
 * информация об аргументе пайпа в цепочке форматирования
 */
export class PipeArgument extends PipeLine {

  constructor(pipes?: Array<PipeInfo | PipeTransform>) {
    super(pipes);
  }

  public argName: string;
}
