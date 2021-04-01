import PluginManager from '@jbrowse/core/PluginManager'
import { getContainingView } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

export function configSchemaFactory(pluginManager: PluginManager) {
  const { types } = pluginManager.lib['mobx-state-tree']
  const { ConfigurationSchema } = pluginManager.lib[
    '@jbrowse/core/configuration'
  ]

  const LGVPlugin = pluginManager.getPlugin(
    'LinearGenomeViewPlugin',
  ) as import('@jbrowse/plugin-linear-genome-view').default
  //@ts-ignore
  const { baseLinearDisplayConfigSchema } = LGVPlugin.exports

  return ConfigurationSchema(
    'QuantitativeSequenceDisplay',
    {
      autoscale: {
        type: 'stringEnum',
        defaultValue: 'local',
        model: types.enumeration('Autoscale type', [
          'global',
          'local',
          'globalsd',
          'localsd',
          'zscore',
        ]),
        description:
          'global/local using their min/max values or w/ standard deviations (globalsd/localsd)',
      },
      minScore: {
        type: 'number',
        defaultValue: Number.MIN_VALUE,
        description: 'minimum value for the y-scale',
      },
      maxScore: {
        type: 'number',
        description: 'maximum value for the y-scale',
        defaultValue: Number.MAX_VALUE,
      },
      numStdDev: {
        type: 'number',
        description:
          'number of standard deviations to use for autoscale types globalsd or localsd',
        defaultValue: 3,
      },
      scaleType: {
        type: 'stringEnum',
        model: types.enumeration('Scale type', ['linear', 'log']), // todo zscale
        description: 'The type of scale to use',
        defaultValue: 'linear',
      },
      inverted: {
        type: 'boolean',
        description: 'draw upside down',
        defaultValue: false,
      },

      defaultRendering: {
        type: 'stringEnum',
        model: types.enumeration('Rendering', ['density', 'xyplot', 'line']),
        defaultValue: 'xyplot',
      },
    },
    { baseConfiguration: baseLinearDisplayConfigSchema, explicitlyTyped: true },
  )
}

export function stateModelFactory(
  pluginManager: PluginManager,
  configSchema: any,
) {
  const { types } = pluginManager.lib['mobx-state-tree']
  const WigglePlugin = pluginManager.getPlugin(
    'WigglePlugin',
  ) as import('@jbrowse/plugin-wiggle').default
  //@ts-ignore
  const { linearWiggleDisplayModelFactory } = WigglePlugin.exports
  return types.compose(
    'QuantitativeSequenceDisplay',
    linearWiggleDisplayModelFactory(pluginManager, configSchema),
    types
      .model({
        type: types.literal('QuantitativeSequenceDisplay'),
      })
      .views(self => ({
        get rendererTypeName() {
          return 'QuantitativeSequenceRenderer'
        },
        get needsScalebar() {
          return true
        },
      })),
  )
}

export type QuantitativeSequenceDisplayModel = ReturnType<
  typeof stateModelFactory
>
