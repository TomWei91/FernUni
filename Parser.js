function parseInputText(textForGeneration) {
    // ----------------- Lexer -----------------
    const createToken = chevrotain.createToken;
    const Lexer = chevrotain.Lexer;

    /*const Type = createToken({
        name: "Type",
        pattern: /(\w|\d)+/
    })
    */

    const DropDatabase = createToken({
        name: "DropDatabase",
        pattern: /DROP DATABASE IF EXISTS/
    });

    const CreateDatabase = createToken({
        name: "CreateDatabase",
        pattern: /CREATE DATABASE/
    });

    const Use = createToken({
        name: "Use",
        pattern: /USE/
    });

    const DropTable = createToken({
        name: "DropTable",
        pattern: /DROP TABLE IF EXISTS/
    });

    const CreateTable = createToken({
        name: "CreateTable",
        pattern: /CREATE TABLE/
    });

    const Comment = createToken({
        name: "Comment",
        pattern: /COMMENT/
    });

    const AlterTable = createToken({
        name: "AlterTable",
        pattern: /ALTER TABLE/
    });

    const ForeignKey = createToken({
        name: "ForeignKey",
        pattern: /ADD CONSTRAINT FOREIGN KEY/
    });

    const Constraint = createToken({
        name: "Constraint",
        pattern: /CONSTRAINT/
    });

    const PrimaryKey = createToken({
        name: "PrimaryKey",
        pattern: /PRIMARY KEY/
    });

    const References = createToken({
        name: "References",
        pattern: /REFERENCES/
    });

    const Semicolon = createToken({
        name: "Semicolon",
        pattern: /;/,
        group: Lexer.SKIPPED
    });


    const OpenBracket = createToken({
        name: "OpenBracket",
        pattern: /\u0028/
    });

    const CloseBracket = createToken({
        name: "OpenBracket",
        pattern: /\u0029/
    });

    const Comma = createToken({
        name: "Comma",
        pattern: /,/,
        group: Lexer.SKIPPED
    });

    const NotNull = createToken({
        name: "NotNull",
        pattern: /NOT NULL/,
        group: Lexer.SKIPPED
    });

    const Integer = createToken({
        name: "Integer",
        pattern: /INTEGER/,
       // longer_alt: Type
    });

    const Varchar = createToken({
        name: "Varchar",
        pattern: /VARCHAR\u0028(\d)+\u0029/,
        //longer_alt: Type
    });

    const Date = createToken({
        name: "Date",
        pattern: /DATE/,
        //longer_alt: Type
    });

    const Time = createToken({
        name: "Time",
        pattern: /TIME/,
        //longer_alt: Type
    });

    const Decimal = createToken({
        name: "Decimal",
        pattern: /DECIMAL/,
        //longer_alt: Type
    });

    const Character = createToken({
        name: "Character",
        pattern: /(\w|\u0027|\u002D)+/
    });

    const WhiteSpace = createToken({
        name: "WhiteSpace", pattern: /\s+/,
        group: Lexer.SKIPPED,
        line_breaks: true
    });


    let SQLTokens = [
        WhiteSpace,
        OpenBracket,
        CloseBracket,
        DropDatabase,
        CreateDatabase,
        Use,
        DropTable,
        CreateTable,
        Comment,
        AlterTable,
        ForeignKey,
        Constraint,
        PrimaryKey,
        References,
        Semicolon,
        Comma,
        NotNull,
        Integer,
        Varchar,
        Date,
        Time,
        Decimal,
        //Type,
        Character,
        
    ];

    let SQLLexer = new Lexer(SQLTokens);

    let SQLresultLexer = SQLLexer.tokenize(textForGeneration);

    //Check the Object with generated Tokens
    console.log(SQLresultLexer);




    // ----------------- parser -----------------

    /*
    //I think not needed
    const SQLVocabulary = {};

    SQLTokens.forEach(tokenType => {
        SQLVocabulary[tokenType.name] = tokenType
    });

    //Check
    console.log(SQLVocabulary);
    */

    const Parser = chevrotain.CstParser;

    class SQLParser extends Parser {
        constructor() {
            super(SQLTokens, { recoveryEnabled: true})


            //$ don't have to write everytime "this"
            const $ = this;

            $.RULE("TableStatement", () => {
                $.SUBRULE($.SkipDropTable)
                $.CONSUME(CreateTable)
                $.CONSUME(Character)
                $.SKIP_TOKEN(OpenBracket)
                $.SUBRULE($.Attributes)
                $.SKIP_TOKEN(CloseBracket)
                $.SKIP_TOKEN(Semicolon)
            })

            $.RULE("Attributes", () => {
                $.MANY(() => {
                    $.CONSUME(Character)
                    $.SUBRULE($.MetaType)
                })
            })
            
            $.RULE("MetaType", () => {
                $.OR([
                    { ALT: () => $.CONSUME(Integer) },
                    { ALT: () => $.CONSUME(Varchar) },
                    { ALT: () => $.CONSUME(Date) },
                    { ALT: () => $.CONSUME(Time) },
                    { ALT: () => $.CONSUME(Decimal) }
                ])

            })

            $.RULE("SkipDropTable", () => {
                $.SKIP_TOKEN(DropDatabase)
                $.SKIP_TOKEN(Character)
                $.SKIP_TOKEN(Semicolon)
            })
            
            // very important to call this after all the rules have been setup.
            this.performSelfAnalysis();
        }

    }

    const SQLParserInstance = new SQLParser();
    SQLParserInstance.input = SQLresultLexer.tokens;
    
    //Check
    console.log(SQLParserInstance);

    //Use Parser Methods and Generate Object + Check
    const testEntity = SQLParserInstance.TableStatement();
    console.log(testEntity);

    // Add a Visitor
    const BaseCstVisitor = parser.getBaseCstVisitorConstructor();

};
