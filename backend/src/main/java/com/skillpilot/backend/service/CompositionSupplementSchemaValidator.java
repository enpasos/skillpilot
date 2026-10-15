package com.skillpilot.backend.service;
import com.fasterxml.jackson.databind.*;
import java.nio.file.*;
import java.util.*;
/** Strict evaluator for the closed supplement schemas' bounded 2020-12 vocabulary.
 * Unknown validation vocabulary fails closed rather than being ignored. */
public final class CompositionSupplementSchemaValidator {
    private final Path directory; private final ObjectMapper mapper;
    public CompositionSupplementSchemaValidator(Path directory, ObjectMapper mapper) { this.directory=directory; this.mapper=mapper; }
    public void validate(JsonNode value, String filename) {
        try { JsonNode schema=mapper.readTree(directory.resolve(filename).toFile()); check(value,schema,schema,"$"); }
        catch(java.io.IOException e) { throw new IllegalStateException("Supplement schema unavailable",e); }
    }
    private void check(JsonNode value,JsonNode schema,JsonNode root,String path) {
        Set<String> vocabulary=Set.of("$schema","$id","title","description","$defs","$ref","type","additionalProperties","required","properties","const","enum","pattern","minLength","maxLength","minItems","maxItems","uniqueItems","items","oneOf","allOf","if","then","else","not","format","minimum","maximum");
        schema.fieldNames().forEachRemaining(k->{if(!vocabulary.contains(k))throw new IllegalStateException("Unsupported supplement schema keyword "+k);});
        if(schema.has("$ref")){String ref=schema.get("$ref").textValue();require(ref!=null&&ref.startsWith("#/"),path);check(value,root.at(ref.substring(1)),root,path);return;}
        if(schema.has("allOf")) for(JsonNode child:schema.get("allOf"))check(value,child,root,path);
        if(schema.has("oneOf")){int matches=0;for(JsonNode child:schema.get("oneOf"))if(matches(value,child,root,path))matches++;require(matches==1,path);}
        if(schema.has("not"))require(!matches(value,schema.get("not"),root,path),path);
        if(schema.has("if")){String branch=matches(value,schema.get("if"),root,path)?"then":"else";if(schema.has(branch))check(value,schema.get(branch),root,path);}
        if(schema.has("type")){String type=schema.get("type").textValue();require(switch(type){case "object"->value!=null&&value.isObject();case "array"->value!=null&&value.isArray();case "string"->value!=null&&value.isTextual();case "boolean"->value!=null&&value.isBoolean();case "integer"->value!=null&&value.isIntegralNumber();case "number"->value!=null&&value.isNumber();default->throw new IllegalStateException("Unsupported schema type "+type);},path);}
        if(schema.has("const"))require(Objects.equals(value,schema.get("const")),path);
        if(schema.has("enum")){boolean found=false;for(JsonNode option:schema.get("enum"))if(option.equals(value))found=true;require(found,path);}
        if(value!=null&&value.isObject()){
            if(schema.has("required"))for(JsonNode key:schema.get("required"))require(value.has(key.textValue()),path+"."+key.textValue());
            JsonNode properties=schema.path("properties");
            value.fieldNames().forEachRemaining(key->{if(properties.has(key))check(value.get(key),properties.get(key),root,path+"."+key);else if(schema.has("additionalProperties")){JsonNode extra=schema.get("additionalProperties");if(extra.isBoolean())require(extra.booleanValue(),path+"."+key);else check(value.get(key),extra,root,path+"."+key);}});
        }
        if(value!=null&&value.isNumber()){if(schema.has("minimum"))require(value.decimalValue().compareTo(schema.get("minimum").decimalValue())>=0,path);if(schema.has("maximum"))require(value.decimalValue().compareTo(schema.get("maximum").decimalValue())<=0,path);}
        if(value!=null&&value.isArray()){
            if(schema.has("minItems"))require(value.size()>=schema.get("minItems").intValue(),path);
            if(schema.has("maxItems"))require(value.size()<=schema.get("maxItems").intValue(),path);
            Set<JsonNode> seen=new HashSet<>();int index=0;
            for(JsonNode member:value){if(schema.path("uniqueItems").booleanValue())require(seen.add(member),path);if(schema.has("items"))check(member,schema.get("items"),root,path+"["+(index++)+"]");}
        }
        if(value!=null&&value.isTextual()){
            String text=value.textValue();int length=text.codePointCount(0,text.length());
            if(schema.has("minLength"))require(length>=schema.get("minLength").intValue(),path);
            if(schema.has("maxLength"))require(length<=schema.get("maxLength").intValue(),path);
            if(schema.has("pattern"))require(java.util.regex.Pattern.compile(schema.get("pattern").textValue(),java.util.regex.Pattern.UNICODE_CHARACTER_CLASS).matcher(text).find(),path);
            if(schema.has("format")){require("uri".equals(schema.get("format").textValue()),path);try{require(java.net.URI.create(text).isAbsolute(),path);}catch(IllegalArgumentException e){require(false,path);}}
        }
    }
    private boolean matches(JsonNode value,JsonNode schema,JsonNode root,String path){try{check(value,schema,root,path);return true;}catch(IllegalStateException exception){return false;}}
    private static void require(boolean pass,String path){if(!pass)throw new IllegalStateException("Supplement schema validation failed at "+path);}
}
