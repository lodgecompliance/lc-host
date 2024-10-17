<template>
    <v-card flat v-bind="cardProps">
        <slot name="header" />
      <v-card-text v-if="!edit">
        <v-row>
          <v-col cols="6" md="4">
            <h4>Required ID verification</h4>
            <p>{{ form.require_id_verification ? 'YES' : 'NO' }}</p>
          </v-col>
          <v-col cols="6" md="4">
            <h4>Collect credit card</h4>
            <p>{{ form.require_credit_card ? 'YES' : 'NO' }}</p>
          </v-col>
          <v-col cols="6" md="4">
            <h4>Auto Approve checkin</h4>
            <p>{{ form.auto_checkin_approval ? 'YES' : 'NO' }}</p>
          </v-col>
          <v-col cols="6" md="4">
            <h4>Send checkin link</h4>
            <p>{{ form.send_checkin_mail ? 'YES' : 'NO' }}</p>
          </v-col>
          <v-col cols="6" md="4">
            <h4>Currency</h4>
            <p>{{ form.currency | nullable }}</p>
          </v-col>
          <v-col cols="6" md="4">
            <slot name="booking-balance" v-bind="form" />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text>
          <template v-if="fields.includes('instructions') && !edit">
            <h4>Instructions</h4>
            <div v-if="form.instruction" v-html="form.instruction"></div>
            <p v-else class="grey--text">No instruction</p>
          </template>
          <slot name="start" v-bind="form" />
          <template v-if="edit">
              <currency-select
              outlined
              label="Currency"
              v-model="form.currency"
              @change="currencySelected"
              dense
              :custom-items="setting.payment_gateway == 'paystack' ? ['NGN'] : undefined"
              />
              <slot name="after-currency" v-bind="form" />
          </template>

          <template v-if="fields.includes('instructions')">
              <div class="my-3">
                <template v-if="edit">
                    <h4 class="mb-3">Instructions:</h4>
                    <property-checkin-instruction-template-select
                        :property="property"
                        label="Select instruction to copy"
                        return-object clearable
                        @input="instructionTemplateSelected"
                        dense
                    />
                    <v-textarea
                        outlined
                        label="Reservation instructions"
                        v-model="form.instruction"
                        @change="emitForm()"
                        class="required"
                        dense
                    ></v-textarea>
                </template>
              </div>
              <slot name="after-instructions" v-bind="form"  />
          </template>

          <template v-if="fields.includes('charges')">
              <h4>Charges</h4>
              <template v-if="!form.charges || !form.charges.length">
                  <p class="grey--text py-3">No charge</p>
              </template>
              <v-alert
              v-if="!paymentIntegrations.length"
              prominent
              border="top"
              colored-border
              type="error">
              <p>No payment integration yet, you won't be able add charges to reservation</p>
                  <v-btn :to="{name: 'property.settings', params: { property: property.id, tab: 'integrations'}}" color="info" text small>Go to integrations</v-btn>
              </v-alert>
              <v-alert
              v-else-if="!setting.payment_gateway"
              border="left"
              colored-border
              type="error">
              <p>Set payment gateway for reservations first before adding charges</p>
                  <v-btn :to="{ name: 'property.settings', params: { property: property.id, tab: 'reservation'}}" color="info" text small>Go to setting</v-btn>
              </v-alert>

              <property-charges-select
                  v-else
                  outlined
                  label="Charges on checkin"
                  v-model="form.charges"
                  :property="property"
                  multiple
                  small-chips
                  return-object
                  dense
                  @change="chargesSelected"
                  :create-new="!!paymentIntegrations.length"
                  :allowed-currency="form.currency"
                  :preview="true"
                  :changeable="edit"
                  :disabled="!paymentIntegrations.length"
                  :disallow-preauthorized="setting.payment_gateway === 'paystack'"
              >
                  <template v-if="edit" #list-item-content="{ charge }">
                      <v-list-item-subtitle>
                          <v-btn x-small text color="red" @click="form.charges.splice(form.charges.findIndex(c => c.id == charge.id), 1)">
                              <v-icon x-small>mdi-delete</v-icon> Remove
                          </v-btn>
                      </v-list-item-subtitle>
                  </template>

                  <template #dropdown-list-item-content="{ item }">
                      <v-list-item-subtitle v-if="item.type === 'pre-authorize' && setting.payment_gateway === 'paystack'">
                          <p class="red--text small"> <v-icon color="red" small>mdi-alert</v-icon> Pre authorize charge not supported for Paystack yet.</p>
                      </v-list-item-subtitle>
                  </template>
              </property-charges-select>
              <slot name="after-charges" v-bind="form"  />
          </template>

          <template v-if="fields.includes('agreements')">
              <h4>Agreements</h4>
              <template v-if="!form.agreements || !form.agreements.length">
                  <p class="grey--text py-3">No agreement</p>
              </template>
              <property-checkin-agreement-select
                  item-text="agreement"
                  outlined
                  label="Agreement for checkin"
                  v-model="form.agreements"
                  :property="property"
                  multiple
                  return-object
                  small-chips
                  dense
                  :create-new="true"
                  :preview="true"
                  :changeable="edit"
                  @change="emitForm()"
              >
                  <template v-if="edit" #list-item-content="{ agreement }">
                      <v-list-item-subtitle>
                          <v-btn x-small text color="red" @click="form.agreements.splice(form.agreements.findIndex(a => a.id == agreement.id), 1)">
                              <v-icon x-small>mdi-delete</v-icon> Remove
                          </v-btn>
                      </v-list-item-subtitle>
                  </template>
              </property-checkin-agreement-select>

              <slot name="after-agreements" v-bind="form"  />
          </template>

          <template v-if="fields.includes('questions')">
              <h4>Questions</h4>
              <template v-if="!form.questions || !form.questions.length">
                  <p class="grey--text py-3">No checkin question</p>
              </template>
              <property-checkin-question-select
                  outlined
                  label="Questions for checkin"
                  v-model="form.questions"
                  :property="property"
                  multiple
                  item-text="question"
                  return-object
                  small-chips
                  dense
                  :create-new="true"
                  :preview="true"
                  :changeable="edit"
                  :allowed-currency="form.currency"
                  @change="emitForm()"
              >
                  <template v-if="edit" #list-item-content="{ question }">
                      <v-list-item-subtitle>
                          <v-btn x-small text color="red" @click="form.questions.splice(form.questions.findIndex(q => q.id == question.id), 1)">
                              <v-icon x-small>mdi-delete</v-icon> Remove
                          </v-btn>
                      </v-list-item-subtitle>
                  </template>
              </property-checkin-question-select>
              <slot name="after-questions" v-bind="form" />
          </template>

          <div>
              <v-switch
                  v-if="edit"
                  v-model="form.require_id_verification"
                  inset dense
                  :disabled="(setting.owned_id_verification && !property.stripe_connected)"
                  @change="emitForm()"
                  >
                  <template #label>
                      <div>
                          Required ID verification
                          <v-chip
                              v-if="setting.owned_id_verification && !property.stripe_connected"
                              x-small color="error">
                              Stripe account is required
                          </v-chip>
                      </div>
                  </template>
              </v-switch>
          </div>

          <div>
              <v-switch
                  v-if="edit"
                  v-model="form.require_credit_card"
                  inset dense
                  :disabled="(paymentRequired || !paymentIntegrations.length)"
                  @change="emitForm()"
                  >
                  <template #label>
                      <div>
                          Collect credit card on file
                          <v-chip
                              v-if="!paymentIntegrations.length"
                              x-small color="error">
                              No payment integration
                          </v-chip>
                      </div>
                  </template>
              </v-switch>
          </div>

          <div>
              <v-switch
                  v-if="edit"
                  v-model="form.allow_additional_guest"
                  inset dense
                  :label="`Additional guest`"
                  @change="emitForm()"
                  >
              </v-switch>
          </div>

          <div>
              <v-switch
                  v-if="edit"
                  v-model="form.auto_checkin_approval"
                  inset dense
                  @change="emitForm()"
                  >
                <template #label>
                  <div>
                      Auto Approve checkin
                      <v-alert v-if="form.require_id_verification && form.auto_checkin_approval"
                      colored-border
                       border="left"
                       color="warning"
                      >
                        <small class="grey--text">
                          If user uploads ID for verification, reservation will not be auto approved until you
                          review and verify the uploaded ID image
                        </small>
                      </v-alert>
                    </div>
                </template>
              </v-switch>
          </div>

           <div>
              <v-switch
                  v-if="edit"
                  v-model="form.send_checkin_mail"
                  inset dense
                  :label="`Send checkin link`"
                  @change="emitForm()"
                  >
              </v-switch>
              <checkin-mail-template v-if="form.send_checkin_mail"
              :fields="fields"
              :value="form.checkin_mail"
              @input="checkinMailInput" />
          </div>
      </v-card-text>
      <v-card-actions>
          <slot name="actions" v-bind="form" />
      </v-card-actions>
    </v-card>
</template>

<script>
import PropertyChargesSelect from '../Components/PropertyChargesSelect.vue';
import PropertyCheckinInstructionTemplateSelect from './PropertyCheckinInstructionSelect.vue';
import PropertyCheckinAgreementSelect from '../Components/PropertyCheckinAgreementSelect.vue';
import PropertyCheckinQuestionSelect from '../Components/PropertyCheckinQuestionSelect.vue';
import CurrencySelect from '../Components/PropertyCurrencySelect.vue';
import CheckinMailTemplate from '../../Reservation/Components/ReservationMessageEditor.vue';

export default {
    name: "BookingChannelReservationForm",
    components: {
        PropertyChargesSelect, PropertyCheckinInstructionTemplateSelect,
        PropertyCheckinAgreementSelect, PropertyCheckinQuestionSelect,
        CurrencySelect, CheckinMailTemplate
    },

    data(){
        return {
            form: {},
        }
    },
    props: {
        edit: Boolean,
        value: Object,
        setting: Object,
        property: Object,
        channel: Object,
        cardProps: Object,
        reservation: Object,
    },

    computed: {
        fields() {
            return this.setting.fields ?? [];
        },

        questionHasAnyChargeAttachment() {
            if(!this.form.question || !this.form.question.length) return false;
            return this.form.questions.some(question => {
                if(question.response_type === 'options' && question.options && question.options.length) {
                    return question.options.some(option => option.attachments && option.attachments.charges && option.attachments.charges.length)
                }
                return false;
            })
        },
        
        paymentRequired() {
            return !!((this.form.charges && this.form.charges.length) || this.questionHasAnyChargeAttachment);
        },

        dialogAttributes() {
            if(!this.edit) return {};
            return {
                'width': 500,
            }
        },

        paymentIntegrations() {
            return this.property.payment_integrations || [];
        }

    },

    methods: {

        instructionTemplateSelected(template) {
            if(!template) return;
            this.form.instruction = this.form.instruction ? `${this.form.instruction}\n${template.body}` : `${template.body}`;
            this.emitForm();
        },

        chargesSelected(charges) {
            if(charges.length) this.form.require_credit_card = true;
            this.emitForm();
        },

        currencySelected(currency) {
            this.form.charges = this.form.charges.filter(charge => charge.currency === currency);
            this.emitForm();
        },

        checkinMailInput(template){
            this.form.checkin_mail = template;
            this.emitForm();
        },

        setForm(form) {           
            if(form){
                this.form = {
                    currency: form.currency,
                    instruction: form.instruction,
                    charges: form.charges,
                    agreements: form.agreements,
                    questions: form.questions,
                    require_id_verification: form.require_id_verification,
                    require_credit_card: form.require_credit_card,
                    allow_additional_guest: form.allow_additional_guest,
                    auto_checkin_approval: form.auto_checkin_approval,
                    send_checkin_mail: form.send_checkin_mail,
                    checkin_mail: form.checkin_mail,
                }
            } else {
                this.form = {
                    currency: this.property.currency,
                    instruction: null,
                    charges: [] ,
                    agreements: [],
                    questions: [],
                    require_id_verification: false,
                    require_credit_card: false, 
                    allow_additional_guest: this.setting.allow_additional_guest,
                    auto_checkin_approval: this.setting.auto_checkin_approval,
                    send_checkin_mail: this.setting.send_checkin_mail,
                    checkin_mail: this.setting.checkin_mail,
                }
                this.emitForm();
            }
        },

        emitForm() {
            this.$emit('input', this.form);
        },

    },

    watch: {

        value: {
            immediate: true,
            handler(v) {
                if(v) {
                    this.setForm(v);
                    return;
                }

                const default_config = this.channel ? this.setting.channel_configurations.find(config => config.id == this.channel.id) : null;
                this.setForm( default_config ? default_config.reservation_form : null);
            }
        },

        // form: {
        //     immediate: true,
        //     handler(form) {
        //         this.$emit('input', form);
        //     }
        // },

        paymentRequired: {
            immediate: true,
            handler(required) {
              if(required) this.form.require_credit_card = true;
            }
        },
        
    }
}
</script>