import { parseForESLint } from "./index";
import { parseForESLint as jsonParse } from 'jsonc-eslint-parser'
import { getTokens } from "./src/Tokens";

const some_tf_string = `resource "google_compute_ssl_policy" "vulnerable_example" { 
                                name = "production-ssl-policy"
                                profile = "MODERN"
                                min_tls_version = "TLS_1_0"
                            }
                        `;

const complex_tf_string =
  `resource "google_compute_ssl_policy" "vulnerable_example" {
                          name = "production-ssl-policy"
                            profile = "MODERN"
                            min_tls_version = "TLS_1_0"
                          }

                        resource "google_compute_ssl_policy" "SECOND_EXAMPLE" { 
                            name = "production-ssl-policy"
                            profile = "MODERN"
                            min_tls_version = "TLS_1_0"
                        }
`;

const emptyString = `;`

const test_string = `{ resource "name" "name2"}`;

const js_string = `
const testRule = {
    create(_context: any) {
      return {
        Identifier(node: any) {
          console.log(node);
          _context.report(node, 'This is unexpected!');
        }
      };
    },
  }

;

export {testRule}`

const json_string = `{
  "glossary": {
      "title": "example glossary",
  "GlossDiv": {
          "title": "S",
    "GlossList": {
              "GlossEntry": {
                  "ID": "SGML",
        "SortAs": "SGML",
        "GlossTerm": "Standard Generalized Markup Language",
        "Acronym": "SGML",
        "Abbrev": "ISO 8879:1986",
        "GlossDef": {
                      "para": "A meta-markup language, used to create markup languages such as DocBook.",
          "GlossSeeAlso": ["GML", "XML"]
                  },
        "GlossSee": "markup"
              }
          }
      }
  }
}`

const extendingParser1 = `resource "google_bigquery_dataset" "dataset" {
  dataset_id = "terragoat__dataset"
  access {
    special_group = "allAuthenticatedUsers"
    role          = "READER"
  }
  labels = {
    git_commit           = "2bdc0871a5f4505be58244029cc6485d45d7bb8e"
    git_file             = "terraform__gcp__big_data_tf"
    git_last_modified_at = "2022-01-19-17-02-27"
    git_last_modified_by = "jameswoolfenden"
    git_modifiers        = "jameswoolfenden__nimrodkor"
    git_org              = "bridgecrewio"
    git_repo             = "terragoat"
    yor_trace            = "2560d883-bc3a-4cb6-b9fc-fb666edf626e"
  }
}
`

const terraGoat = `resource "google_sql_database_instance" "master_instance" {

  database_version = "POSTGRES_11"
  
  settings {
    tier = "db-f1-micro"
    ip_configuration {
      ipv4_enabled = true
      authorized_networks {
        name  = "WWW"
        value = "0.0.0.0/0"
      }
    }
    backup_configuration {
      enabled = false
    }
  }
}

resource "google_bigquery_dataset" "dataset" {
  dataset_id = "terragoat__dataset"
  access {
    special_group = "allAuthenticatedUsers"
    role          = "READER"
  }
  labels = {
    git_commit           = "2bdc0871a5f4505be58244029cc6485d45d7bb8e"
    git_file             = "terraform__gcp__big_data_tf"
    git_last_modified_at = "2022-01-19-17-02-27"
    git_last_modified_by = "jameswoolfenden"
    git_modifiers        = "jameswoolfenden__nimrodkor"
    git_org              = "bridgecrewio"
    git_repo             = "terragoat"
    yor_trace            = "2560d883-bc3a-4cb6-b9fc-fb666edf626e"
  }
}
`

const terragoatNetworks = `resource "google_compute_network" "vpc" {
  name                    = "terragoat--network"
  description             = "Virtual vulnerable-by-design network"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public-subnetwork" {
  name          = "terragoat--public-subnetwork"
  ip_cidr_range = "10.0.0.0/24"


  secondary_ip_range {
    range_name    = "tf-test-secondary-range-update1"
    ip_cidr_range = "192.168.10.0/24"
  }
}

resource "google_compute_firewall" "allow_all" {
  name          = "terragoat--firewall"

  source_ranges = ["0.0.0.0/0"]
  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }
}`

const ip = `ip_cidr_range = "10.0.0.0/24"`
const list = `blockRange = {"text" "NewText"}
listRange = ["listtext"]`

// const ast = parse(some_json_string);
// const ast = parseForESLint(complex_tf_string, {});
// const jsonAst = jsonParse(json_string)
// const ast = getTokens(some_tf_string);

// console.log(jsonAst)
// console.log(ast)

const ast = parseForESLint(list, {});
console.log(JSON.stringify(ast, null, 3));


// Tokens
// const tokens = getTokens(terraGoat)

// // Terragoat
// const goatAst = parseForESLint(terraGoat, {})
// console.log(JSON.stringify(goatAst, null, 3));