<template>
    <div>
        <h4>
          <v-icon class="mr-2">mdi-attachment</v-icon> Attachments
        </h4>

        <template v-if="attachments.agreements && attachments.agreements.length">
             <div class="d-flex my-2">
                <h3>Agreements</h3>
                <v-btn small icon color="primary" class="ml-2"
                @click="editAttachment({type: 'Agreement', attachments: attachments.agreements})">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </div>
            <property-agreement-list :agreements="attachments.agreements">
                <template #list-item-action="{ agreement }">
                    <v-btn small icon color="red" @click="removeAttachment(agreement, 'agreements')">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
            </property-agreement-list>
        </template>

        <template v-if="attachments.charges && attachments.charges.length">
            <div class="d-flex my-2">
                <h3>Charges</h3>
                <v-btn small icon color="primary" class="ml-2"
                @click="editAttachment({type: 'Charge', attachments: attachments.charges})">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </div>
            <property-charge-list :charges="attachments.charges">
                <template #list-item-action="{ charge }">
                    <v-btn small icon color="red" @click="removeAttachment(charge, 'charges')">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
            </property-charge-list>
        </template>

        <template v-if="attachments.questions && attachments.questions.length">
           <div class="d-flex my-2">
                <h3>Questions</h3>
                <v-btn small icon color="primary" class="ml-2"
                @click="editAttachment({type: 'Question', attachments: attachments.questions})">
                    <v-icon>mdi-pencil</v-icon>
                </v-btn>
            </div>
            <property-question-list :questions="attachments.questions">
                <template #list-item-action="{ question }">
                    <v-btn small icon color="red" @click="removeAttachment(question, 'questions')">
                        <v-icon>mdi-delete</v-icon>
                    </v-btn>
                </template>
            </property-question-list>
        </template>
        <v-btn color="primary" small depressed @click="addAttachment" class="my-2">
          <v-icon>mdi-plus</v-icon> New Attachment
        </v-btn>
        <property-attachment-form
        :open="attachmentForm"
        :property="property"
        :value="attachment"
        @input="attachmentInput"
        @close="attachmentForm = false"
        :parent="parent"
        :allowedCurrency="allowedCurrency"
        />

    </div>
</template>

<script>
import PropertyAttachmentForm from './PropertyAttachmentForm.vue';
import PropertyAgreementList from './PropertyAgreementList.vue';
import PropertyChargeList from './PropertyChargeList.vue';
import PropertyQuestionList from './PropertyQuestionList.vue';

export default {
    name: "PropertyAttachments",
    components: {
        PropertyAttachmentForm, 
        PropertyAgreementList, PropertyChargeList, PropertyQuestionList
    },
    data() {
        return {
            attachmentForm: false,
            attachment: {
                type: null,
                attachments: [],
            },
            attachments: {
                agreements: [],
                charges: [],
                questions: []
            }
        }
    },
    props: {
        property: Object,
        value: {},
        parent: Object,
        allowedCurrency: String
    },
    methods: {

        addAttachment() {
          this.$emit('add-attachmentt');
          this.attachmentForm = true
        },

        attachmentInput(attachment) {
             const types = {
                Agreement: 'agreements',
                Charge: 'charges',
                Question: 'questions',
            }
            const newAttachments = attachment.attachments.filter(newAttachment => {
                return this.attachments[types[attachment.type]].findIndex(a => a.id === newAttachment.id) < 0
            });

            this.attachments[types[attachment.type]] = this.attachments[types[attachment.type]].concat(newAttachments)
            this.$emit('input', this.attachments);

            this.attachment = null;
        },


        editAttachment(attachment) {
            this.attachment = attachment;
            this.attachmentForm = true;
        },

        removeAttachment(attachment, from) {
            const index = this.attachments[from].findIndex(a => a.id == attachment.id);
            if(index >= 0) {
                this.attachments[from].splice(index, 1)
            }
            this.$emit('input', this.attachments);
        }
    },

    watch: {
        value: {
            immediate: true,
            handler(attachments) {
                if(attachments) {
                    this.attachments = {
                        agreements: attachments.agreements ? attachments.agreements : [],
                        charges: attachments.charges ? attachments.charges : [],
                        questions: attachments.questions ? attachments.questions : []
                    } 
                }
            }
        }
    }
}
</script>